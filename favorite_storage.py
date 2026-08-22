import os
import json
import base64
import datetime
from typing import Optional, Dict, Any

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    from google.cloud import storage
except ImportError:
    storage = None

class FavoriteStorageManager:
    """
    Manages persistent storage for the single designated favorite channel output.
    Saves metadata, scripts, YouTube song tracks, and high-fidelity audio files.
    
    Architecture:
    1. Local Deployment: Persists in local filesystem directory `data/favorite/`.
    2. Cloud Run Deployment: Syncs seamlessly to a Google Cloud Storage (GCS) bucket
       to guarantee persistence even across container recycles, scale-to-zero events,
       and instance restarts.
    3. Strict Single-Favorite Invariant: Only one channel output is mapped to favorite at any time.
    """

    def __init__(self, project_id: str = "", bucket_name: str = "", local_dir: str = ""):
        self.project_id = project_id or os.getenv("GCP_PROJECT", "")
        self.bucket_name = (
            bucket_name 
            or os.getenv("GCS_FAVORITE_BUCKET", "") 
            or (f"{self.project_id}-ai-rj-favorites" if self.project_id else "")
        )
        
        if not local_dir:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            self.local_dir = os.path.join(base_dir, "data", "favorite")
        else:
            self.local_dir = local_dir

        os.makedirs(self.local_dir, exist_ok=True)
        self.meta_file = os.path.join(self.local_dir, "favorite.json")
        self.audio1_file = os.path.join(self.local_dir, "segment1_audio.wav")
        self.audio2_file = os.path.join(self.local_dir, "segment2_audio.wav")

        self._gcs_client = None
        self._gcs_bucket = None

    def _get_gcs_bucket(self):
        """Initializes and returns the GCS bucket instance if available."""
        if not storage or not self.project_id or not self.bucket_name:
            return None
        if self._gcs_bucket is not None:
            return self._gcs_bucket
        try:
            self._gcs_client = storage.Client(project=self.project_id)
            bucket = self._gcs_client.bucket(self.bucket_name)
            if not bucket.exists():
                try:
                    bucket = self._gcs_client.create_bucket(self.bucket_name, location="US")
                    print(f"[Favorite Storage] Created GCS bucket: {self.bucket_name}")
                except Exception as ce:
                    print(f"[Favorite Storage] Could not auto-create GCS bucket {self.bucket_name}: {ce}")
            self._gcs_bucket = bucket
            return self._gcs_bucket
        except Exception as e:
            print(f"[Favorite Storage] GCS client initialization notice: {e}")
            return None

    def save_favorite(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Saves the channel output as the single favorite.
        Overwrites any previous favorite locally and in GCS.
        """
        os.makedirs(self.local_dir, exist_ok=True)

        seg1 = data.get("segment1", {})
        seg2 = data.get("segment2", {})

        # 1. Extract and write audio files locally
        audio1_b64 = seg1.get("audio_base64") or data.get("audio1_base64", "")
        audio2_b64 = seg2.get("audio_base64") or data.get("audio2_base64", "")

        has_audio1 = False
        if audio1_b64 and len(audio1_b64.strip()) > 10:
            try:
                audio1_bytes = base64.b64decode(audio1_b64)
                with open(self.audio1_file, "wb") as f:
                    f.write(audio1_bytes)
                has_audio1 = True
            except Exception as e:
                print(f"[Favorite Storage] Error writing segment 1 audio: {e}")

        has_audio2 = False
        if audio2_b64 and len(audio2_b64.strip()) > 10:
            try:
                audio2_bytes = base64.b64decode(audio2_b64)
                with open(self.audio2_file, "wb") as f:
                    f.write(audio2_bytes)
                has_audio2 = True
            except Exception as e:
                print(f"[Favorite Storage] Error writing segment 2 audio: {e}")

        # 2. Build favorite metadata object
        timestamp_now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        favorite_payload = {
            "show_title": data.get("show_title", "My Favorite RJ Broadcast"),
            "persona": data.get("persona", ""),
            "personality": data.get("personality", ""),
            "theme": data.get("theme", ""),
            "additional_info": data.get("additional_info", ""),
            "language_region": data.get("language_region", "en-IN"),
            "broadcast_mode": data.get("broadcast_mode", "single"),
            "segment1": {
                "title": seg1.get("title", "Segment 1"),
                "script": seg1.get("script", ""),
                "songs": seg1.get("songs", []),
                "song_tracks": seg1.get("song_tracks", []),
                "has_audio": has_audio1,
                "audio_url": "/favorite/audio/1" if has_audio1 else ""
            },
            "segment2": {
                "title": seg2.get("title", "Segment 2"),
                "script": seg2.get("script", ""),
                "songs": seg2.get("songs", []),
                "song_tracks": seg2.get("song_tracks", []),
                "has_audio": has_audio2,
                "audio_url": "/favorite/audio/2" if has_audio2 else ""
            },
            "updated_at": timestamp_now,
            "is_favorite": True
        }

        # 3. Write metadata to local JSON cache
        with open(self.meta_file, "w", encoding="utf-8") as f:
            json.dump(favorite_payload, f, indent=2, ensure_ascii=False)

        # 4. Sync to GCS Bucket if accessible (for Cloud Run persistence)
        try:
            bucket = self._get_gcs_bucket()
            if bucket:
                # Upload metadata
                meta_blob = bucket.blob("favorite/favorite.json")
                meta_blob.upload_from_string(
                    json.dumps(favorite_payload, indent=2, ensure_ascii=False),
                    content_type="application/json"
                )

                # Upload audio files
                if has_audio1 and os.path.exists(self.audio1_file):
                    blob1 = bucket.blob("favorite/segment1_audio.wav")
                    blob1.upload_from_filename(self.audio1_file, content_type="audio/wav")

                if has_audio2 and os.path.exists(self.audio2_file):
                    blob2 = bucket.blob("favorite/segment2_audio.wav")
                    blob2.upload_from_filename(self.audio2_file, content_type="audio/wav")

                print(f"[Favorite Storage] Successfully synced favorite to GCS bucket '{self.bucket_name}'")
        except Exception as ge:
            print(f"[Favorite Storage] GCS sync notice: {ge}")

        # Return full payload with base64 audio for immediate frontend responsiveness
        result = dict(favorite_payload)
        result["segment1"]["audio_base64"] = audio1_b64 if has_audio1 else ""
        result["segment2"]["audio_base64"] = audio2_b64 if has_audio2 else ""
        return result

    def get_favorite(self) -> Optional[Dict[str, Any]]:
        """
        Retrieves the saved favorite channel output.
        If local cache is missing (e.g. fresh Cloud Run instance), pulls from GCS bucket.
        """
        # If local metadata doesn't exist, try restoring from GCS
        if not os.path.exists(self.meta_file):
            try:
                bucket = self._get_gcs_bucket()
                if bucket:
                    meta_blob = bucket.blob("favorite/favorite.json")
                    if meta_blob.exists():
                        os.makedirs(self.local_dir, exist_ok=True)
                        meta_blob.download_to_filename(self.meta_file)
                        print("[Favorite Storage] Restored favorite metadata from GCS bucket")

                        # Restore audio files if available
                        blob1 = bucket.blob("favorite/segment1_audio.wav")
                        if blob1.exists():
                            blob1.download_to_filename(self.audio1_file)

                        blob2 = bucket.blob("favorite/segment2_audio.wav")
                        if blob2.exists():
                            blob2.download_to_filename(self.audio2_file)
            except Exception as e:
                print(f"[Favorite Storage] GCS restore notice: {e}")

        if not os.path.exists(self.meta_file):
            return None

        try:
            with open(self.meta_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            # Load audio base64 from local files if present
            audio1_b64 = ""
            if os.path.exists(self.audio1_file):
                with open(self.audio1_file, "rb") as f:
                    audio1_b64 = base64.b64encode(f.read()).decode("utf-8")

            audio2_b64 = ""
            if os.path.exists(self.audio2_file):
                with open(self.audio2_file, "rb") as f:
                    audio2_b64 = base64.b64encode(f.read()).decode("utf-8")

            data["segment1"]["audio_base64"] = audio1_b64
            data["segment2"]["audio_base64"] = audio2_b64
            return data
        except Exception as e:
            print(f"[Favorite Storage] Error reading favorite metadata: {e}")
            return None

    def delete_favorite(self) -> bool:
        """
        Deletes the favorite channel output locally and in GCS.
        """
        # Delete local files
        for p in [self.meta_file, self.audio1_file, self.audio2_file]:
            if os.path.exists(p):
                try:
                    os.remove(p)
                except Exception:
                    pass

        # Delete GCS blobs
        try:
            bucket = self._get_gcs_bucket()
            if bucket:
                for b_name in ["favorite/favorite.json", "favorite/segment1_audio.wav", "favorite/segment2_audio.wav"]:
                    blob = bucket.blob(b_name)
                    if blob.exists():
                        blob.delete()
                print("[Favorite Storage] Deleted favorite from GCS bucket")
        except Exception as ge:
            print(f"[Favorite Storage] GCS delete notice: {ge}")

        return True

    def get_audio_file(self, segment_id: int) -> Optional[str]:
        """
        Returns local path to the audio file for the requested segment (1 or 2).
        Restores from GCS if not present locally.
        """
        target_file = self.audio1_file if segment_id == 1 else self.audio2_file
        if os.path.exists(target_file):
            return target_file

        # Attempt download from GCS
        try:
            bucket = self._get_gcs_bucket()
            if bucket:
                blob_name = f"favorite/segment{segment_id}_audio.wav"
                blob = bucket.blob(blob_name)
                if blob.exists():
                    os.makedirs(self.local_dir, exist_ok=True)
                    blob.download_to_filename(target_file)
                    return target_file
        except Exception as e:
            print(f"[Favorite Storage] Error retrieving audio from GCS: {e}")

        return None

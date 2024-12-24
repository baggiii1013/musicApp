from mutagen.flac import FLAC
from mutagen.id3 import APIC, PictureType


def extract_cover_art(filepath):
    try:
        audio = FLAC(filepath)
        if 'APIC:' in audio:  # Check for APIC frame (ID3 cover art)
            artwork = audio['APIC:']
            return artwork.data
        else:  # check for FLAC Picture Block
            for item in audio.pictures:
                return item.data
    except Exception as e:
        print(f"Error extracting artwork: {e}")
        return None


# Example use
filepath = "E:/Kaustubh code/Sigma web development/musicApp/songs/A.R. Rahman - Kun Faya Kun.flac"
cover_art = extract_cover_art(filepath)
if cover_art:
    # Process cover art (e.g., save to file, display)
    with open("cover.jpg", "wb") as f:
        f.write(cover_art)

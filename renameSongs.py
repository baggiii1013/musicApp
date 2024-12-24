import os

def rename_songs():
    # Get the songs directory path
    songs_dir = "songs"
    
    try:
        # List all files in the songs directory
        for filename in os.listdir(songs_dir):
            if os.path.isfile(os.path.join(songs_dir, filename)):
                # Create new filename by removing first 4 characters
                new_filename = filename[4:]
                
                # Get full paths
                old_path = os.path.join(songs_dir, filename)
                new_path = os.path.join(songs_dir, new_filename)
                
                # Rename file
                os.rename(old_path, new_path)
                print(f"Renamed: {filename} -> {new_filename}")
                
    except Exception as e:
        print(f"Error occurred: {str(e)}")

if __name__ == "__main__":
    rename_songs()
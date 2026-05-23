#!/usr/bin/env python3
import os
import shutil
import subprocess
import sys
import glob

def get_file_size(path):
    try:
        return os.path.getsize(path)
    except OSError:
        return 0

def format_size(bytes_size):
    if bytes_size < 1024:
        return f"{bytes_size} B"
    elif bytes_size < 1024 * 1024:
        return f"{bytes_size / 1024:.2f} KB"
    else:
        return f"{bytes_size / (1024 * 1024):.2f} MB"

def update_html_references(workspace_dir, old_filename, new_filename):
    """
    Scans HTML files in the workspace and updates references from old_filename to new_filename.
    Also cleans up HEIC-specific error handling attributes.
    """
    html_files = glob.glob(os.path.join(workspace_dir, "*.html"))
    updated_files = []
    
    for html_path in html_files:
        try:
            with open(html_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Check if reference exists (case insensitive)
            if old_filename.lower() in content.lower():
                # Case-insensitive replacement
                import re
                
                # Replace the filename
                pattern = re.compile(re.escape(old_filename), re.IGNORECASE)
                content = pattern.sub(new_filename, content)
                
                # If we are converting HEIC to JPG, look for onerror handlers for this image and clean them
                if old_filename.lower().endswith('.heic'):
                    # Match onerror attributes that specifically warn about HEIC rendering
                    onerror_pattern = re.compile(
                        r'onerror\s*=\s*"[^"]*HEIC[^"]*"', 
                        re.IGNORECASE
                    )
                    content = onerror_pattern.sub('', content)
                    
                    # Clean up double spaces that might result from removing attributes
                    content = re.sub(r'[ \t]{2,}>', '>', content)
                    content = re.sub(r'[ \t]{2,}', ' ', content)
                
                with open(html_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                updated_files.append(os.path.basename(html_path))
        except Exception as e:
            print(f"Error updating HTML {html_path}: {e}")
            
    return updated_files

def compress_image_directory(target_dir, workspace_dir, max_dim=2000, quality=80):
    print("=" * 70)
    print(f"Starting Image Compression in: {target_dir}")
    print(f"Settings: Max Dimension = {max_dim}px, JPEG Quality = {quality}%")
    print("=" * 70)
    
    if not os.path.exists(target_dir):
        print(f"Error: Directory '{target_dir}' does not exist.")
        return
        
    # Create Originals backup directory
    originals_dir = os.path.join(target_dir, "Originals")
    if not os.path.exists(originals_dir):
        os.makedirs(originals_dir)
        print(f"Created backup directory: {originals_dir}")
    else:
        print(f"Backup directory already exists: {originals_dir}")
        
    # Get all files in directory
    files = [f for f in os.listdir(target_dir) if os.path.isfile(os.path.join(target_dir, f))]
    
    supported_extensions = ['.jpg', '.jpeg', '.heic', '.png']
    images_to_process = []
    
    for file in files:
        ext = os.path.splitext(file)[1].lower()
        if ext in supported_extensions:
            images_to_process.append(file)
            
    if not images_to_process:
        print("No supported images found to process.")
        return
        
    print(f"Found {len(images_to_process)} images to process.")
    
    results = []
    total_original_size = 0
    total_compressed_size = 0
    
    for filename in images_to_process:
        src_path = os.path.join(target_dir, filename)
        backup_path = os.path.join(originals_dir, filename)
        
        orig_size = get_file_size(src_path)
        total_original_size += orig_size
        
        # 1. Back up the file by copying it to Originals folder
        try:
            shutil.copy2(src_path, backup_path)
        except Exception as e:
            print(f"Failed to back up {filename}: {e}. Skipping.")
            continue
            
        # 2. Process the image
        ext = os.path.splitext(filename)[1].lower()
        base_name = os.path.splitext(filename)[0]
        
        success = False
        new_filename = filename
        dest_path = src_path
        
        if ext == '.heic':
            # HEIC files are converted to JPEG for web compatibility
            new_filename = f"{base_name}.jpg"
            dest_path = os.path.join(target_dir, new_filename)
            
            print(f"Converting and compressing HEIC: {filename} -> {new_filename}...", end="", flush=True)
            
            # command: sips -s format jpeg -s formatOptions quality -Z max_dim input.heic --out output.jpg
            cmd = [
                "sips",
                "-s", "format", "jpeg",
                "-s", "formatOptions", str(quality),
                "-Z", str(max_dim),
                src_path,
                "--out", dest_path
            ]
            
            try:
                res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                if res.returncode == 0:
                    # Remove the original .heic from the active folder
                    os.remove(src_path)
                    success = True
                    # Update references in HTML files!
                    html_updated = update_html_references(workspace_dir, filename, new_filename)
                else:
                    print(f"\nError converting HEIC: {res.stderr}")
            except Exception as e:
                print(f"\nException: {e}")
                
        elif ext in ['.jpg', '.jpeg']:
            print(f"Compressing JPEG: {filename}...", end="", flush=True)
            
            # command: sips -s format jpeg -s formatOptions quality -Z max_dim input.jpg --out input.jpg
            cmd = [
                "sips",
                "-s", "format", "jpeg",
                "-s", "formatOptions", str(quality),
                "-Z", str(max_dim),
                src_path,
                "--out", src_path
            ]
            
            try:
                res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                if res.returncode == 0:
                    success = True
                else:
                    print(f"\nError compressing JPEG: {res.stderr}")
            except Exception as e:
                print(f"\nException: {e}")
                
        elif ext == '.png':
            print(f"Rescaling PNG: {filename}...", end="", flush=True)
            
            # PNG is lossless, so we only downscale it
            cmd = [
                "sips",
                "-Z", str(max_dim),
                src_path,
                "--out", src_path
            ]
            
            try:
                res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                if res.returncode == 0:
                    success = True
                else:
                    print(f"\nError rescaling PNG: {res.stderr}")
            except Exception as e:
                print(f"\nException: {e}")
                
        if success:
            new_size = get_file_size(dest_path)
            
            # If the compressed file is larger or equal (can happen for already tiny optimized images),
            # restore the original from the backup (except for HEIC since we must keep the converted JPG).
            if new_size >= orig_size and ext != '.heic':
                try:
                    shutil.copy2(backup_path, src_path)
                    new_size = orig_size
                    print(" (Kept original - smaller)", end="")
                except Exception as e:
                    print(f" (Failed to restore original: {e})", end="")
                    
            total_compressed_size += new_size
            savings = orig_size - new_size
            pct = (savings / orig_size) * 100 if orig_size > 0 else 0
            
            print(f" Done! {format_size(orig_size)} -> {format_size(new_size)} (-{pct:.1f}%)")
            
            results.append({
                "original_name": filename,
                "new_name": new_filename,
                "original_size": orig_size,
                "new_size": new_size,
                "savings": savings,
                "percent": pct,
                "status": "Success"
            })
        else:
            print(" Failed!")
            total_compressed_size += orig_size
            results.append({
                "original_name": filename,
                "new_name": filename,
                "original_size": orig_size,
                "new_size": orig_size,
                "savings": 0,
                "percent": 0.0,
                "status": "Failed"
            })
            
    # Output report
    print("\n" + "=" * 70)
    print("COMPRESSION SUMMARY REPORT")
    print("=" * 70)
    print(f"{'Filename':<30} | {'Original':<10} | {'Optimized':<10} | {'Saved %':<8}")
    print("-" * 70)
    for r in results:
        name_display = r["original_name"]
        if r["original_name"] != r["new_name"]:
            name_display = f"{r['original_name']} -> {r['new_name']}"
            
        if len(name_display) > 30:
            name_display = name_display[:27] + "..."
            
        print(f"{name_display:<30} | {format_size(r['original_size']):<10} | {format_size(r['new_size']):<10} | {r['percent']:.1f}%")
        
    print("-" * 70)
    total_savings = total_original_size - total_compressed_size
    total_pct = (total_savings / total_original_size) * 100 if total_original_size > 0 else 0
    print(f"{'TOTAL':<30} | {format_size(total_original_size):<10} | {format_size(total_compressed_size):<10} | {total_pct:.1f}%")
    print(f"Total space saved: {format_size(total_savings)}")
    print("=" * 70)
    print("Note: Original files are safely backed up in the 'Originals/' folder.")
    print("=" * 70)
    
    return results

if __name__ == "__main__":
    workspace = "/Users/mcquockhanh/Documents/LandingPage 2026/MC Quang Hiển Wedding"
    
    # Target directory 1: Anh Hiển Update
    dir_to_compress = os.path.join(workspace, "assets", "Anh Hiển Update")
    
    if len(sys.argv) > 1:
        # User specified a directory or option
        arg = sys.argv[1]
        if arg == "--images":
            dir_to_compress = os.path.join(workspace, "assets", "images")
        elif os.path.exists(arg):
            dir_to_compress = arg
            
    compress_image_directory(dir_to_compress, workspace)

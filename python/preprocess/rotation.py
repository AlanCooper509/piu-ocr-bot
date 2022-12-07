from PIL.ExifTags import TAGS

def fix_rotation(img):
    """
    looks for EXIF photo metadata, uses that to correct orientation.
    (OCR won't work on input images that are not corrected for rotation)
    """
    for orientation in TAGS.keys():
        if TAGS[orientation]=='Orientation':
            break
    
    exif = img._getexif()
    if orientation in exif:
        if exif[orientation] == 3:
            img=img.rotate(180, expand=True)
        elif exif[orientation] == 6:
            img=img.rotate(270, expand=True)
        elif exif[orientation] == 8:
            img=img.rotate(90, expand=True)
    
    return img
description of some of the files and folders in this directory:
|
|___README_icons.txt ... this file
|
|___gp_check_noimg.png ... old 48px icon for items without photo. New individualized icons are inside the icons36-noimg directory now.
|
|___gp_check_missing.png ... old 48px icon for items without photo and with missing tags. New individualized icons for guideposts and rescue points 
|                            are inside the icons36-missing directory now. Do we need such icons for other items too?
|___gp_check_noref.png ... old 48px icon as above but with a question mark over the camera. Not sure if used at all. Anyway, new individualized
|                          icons for guideposts and rescue points are inside the icons36-missing directory now. Do we need more?
|___gp_check_tourism.png ... old 48px icon for unknown "tourism" items. A 36px version is are inside the icons36-unknown directory now.
|                            
|___src ... source files (layers in XCF format)
|
|___gp ... old icons 48x48px (not only guideposts) - subdir to be renamed to "icons48", to be replaced with the following
|
|___icons36 ... new icons 36x36px
|
|___icons36-noimg ... new icons 36x36px - icons in grayscale with a red-crossed camera on top. Same filenames as in icons36.


2022-04-08 Changes:
- new set of icons 36x36px (except for photoDB-add.png that remains 48x48px)
- new IMAGE ANCHOR COORDINATES: the suggested X-Y coordinates of the anchor are 18-35 px from the left-top corner
- new icon for road cycling guideposts
- new icon for city quideposts
- a "pole" added to all route marker icons to show the anchor point (where it actually belongs to on the map)
- red dot on horse guidepost shifted inwards from the tip of the plate to make the horse gp easier to distinguish from the others
- new individual "no photo - needs photo" version (greyscale with a red cross on a camera picture) is now available for all icons.
  These extra icons are located in the icons36-noimg directory. Names of the icons are the same as those of the color ones in the icons36 dir.
- icon unknown.png has been converted to greyscale in its 36px version, assuming that it is used for items that are of unknown type but
  we do have their photo, so there is no need for further action. Please use unknown-red.png for items that do require attention of the map user.

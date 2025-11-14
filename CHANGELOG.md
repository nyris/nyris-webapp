# Changelog

All notable changes to this project will be documented in this file.
This project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.3.86 - 2025-11-14

### Added
- Product link base URL for widget

## 0.3.85 - 2025-11-07

### Updated
- Carousel size in Products Detail View popup

## 0.3.84 - 2025-11-05

### Updated
- Mobile camera icon
- Minimum size for product detail popup

### Fixed
- Product detail popup carousel

## 0.3.83 - 2025-09-23

### Updated
- Removed animation border of Preview
- Change cursor on resize regions

## 0.3.82 - 2025-08-15

### Added
- Geo Location for webapp

## 0.3.81 - 2025-06-25

### Added
- inquiry for widget

## 0.3.80 - 2025-06-17

### Added
- removed sorting from post filter

## 0.3.79 - 2025-06-10

### Added
- CTA button for Simple Card View
- Post filters: load more, search and alphabetical order

## 0.3.78 - 2025-04-25

### Added
- improve image preview performance

## 0.3.77 - 2025-04-24

### Added
- PDF support
- get image url from query param
- delay in cropping frame

## 0.3.76 - 2025-03-14

### Added
- Rename of css classname for popup in Widget
- Fix logos colours

## 0.3.75 - 2025-03-12

### Added
- Default logos for languages in Widget
- More languages for Widget
- Fixed position of searched image preview for Widget
- Added support for downloading images via drag and drop from an image URL

## 0.3.74 - 2025-03-04

### Added
- Search suite - Algolia decoupling
- Search suite - Removed Redux & introduced zustand
- Widget - language & logo change

## 0.3.73 - 2025-01-30

### Hotifx
- Made heic check case-insensitive

## 0.3.72 - 2025-01-16

### Added
- Translation for RFQ/support flow

## 0.3.71 - 2024-12-31

### Added
- Added some translations
- prefilterFieldName setting for Inquiry modal 

## 0.3.70 - 2024-12-31

### Added
- Added .heic support
- View details attributes

## 0.3.69 - 2024-12-20

### Added
- updated widget readme

## 0.3.68 - 2024-12-17

### Added
- enable CAD search

## 0.3.67 - 2024-12-11

### Added
- preload for experience visual search images
- pre filter & post filter for widget
- CAD search codebase for search suite

## 0.3.66 - 2024-12-06

### Fix
- Image compression not occurring for experience visual search images

## 0.3.65 - 2024-11-12

### Removed
- Disabled clarity

## 0.3.64 - 2024-11-12

### Fixed
- Show '-' when attribute value is missing

## 0.3.63 - 2024-11-04

### Updated
- Search suite settings file structure

## 0.3.62 - 2024-10-30

### Added
- Multiple initiator element id for widget
- Feedback for widget

## 0.3.61 - 2024-10-24

### Added
- Pre-filter and metadata CTA link for Widget
- Field flexibility for Search Suite
- Feedback for search suite

### Tech debts
- Move Icons to react-components
- Remove Cadenas codes and use nyris assets instead

## 0.3.60 - 2024-10-16

### Fix
- Fix pipeline: publish to github not working


## 0.3.59 - 2024-10-15

### Added
- Multi image search
- Feedback
- Cadenas for widget
- 
### Removed
- Elastic/text search 

## 0.3.58 - 2024-09-12

### Fix
- Sorting pre-filters in alphabetical order

### Added
- Parameter for hiding similar search

## 0.3.57 - 2024-08-02

### Added
- Add clarity for search suite
- Vizo stable release
- Simplified product card view

## 0.3.56 - 2024-07-15

### Added
- Changing results, go-back and post-filter sections layout
- Update font size for simplified card view

## 0.3.55 - 2024-07-10

### Added
- Go Back functionality for Webapp and Widget
- Placed Search bar on Header
- Added Simple Card View

## 0.3.54 - 2024-04-24

### Fix
- CTA button icon position

## 0.3.53 - 2024-04-18

### Updated
- Decreased cropping minimum width & height

### Added
- Experience Visual Search feature

## 0.3.52 - 2024-04-18

### Fix
- react webapp not publish build

### Added
- use user metadata from auth0
- changing secondary CTA button style

## 0.3.51 - 2024-04-17

### Added
- Updated react to 18
- Updated lerna to 8
- bypass region api call if it fails
- disable feedback
- function to add widget in runtime
- Updated package manager to yarn
- Updated pipeline

### Removed
- Removed <Box> usage of material ui

## 0.3.50 - 2024-04-08

### Fix
- Object detection pointer is not initiating find API

## 0.3.49 - 2024-03-25

### Fix
- Fix mobile preview not expanding correctly if system resources are low
- Update DE translations of widget
- Add secondary CTA Button

## 0.3.48 - 2024-03-01

### Added
- Widget release
- DE translations for pre-filter
- Updated example settings file
- Added post filter for Elastic version of search suite

### Fix
- On enter button the page refreshes

## 0.3.47 - 2024-01-31

### Added
- Decrease preview animation time
- Add de translation for No matches found
 
### Fix
- Camera cut issue on iOS >= 17.2

## 0.3.46 - 2024-01-25

### Added
- Support/Inquiry Functionality Enhancement
- New feedback UI 

### Fix
- Fix for search bar position and missing property values on email inquiry

## 0.3.45 - 2024-01-12

### Added
- Added CTA button custom text

## 0.3.44 - 2023-12-29

### Removed
- Removed Google analytics

## 0.3.43 - 2023-12-21

### Added

- Add auth0 flow
- Add powered by nyris
- Settings to Show result from find api if algolia is disabled

### Removed
- Removed unused redux store

## 0.3.42 - 2023-11-28

### Added

- Add Catalog and CadenasAPIKey to settings.js

### Fix

- Carousel width for desktop

## 0.3.41 - 2023-11-08

### Added

- Add Template ID to settings.js

## 0.3.40 - 2023-10-31

### Added

- Add some translations
- Expanded image preview for mobile

### Fix

- Center search bar in landing page

## 0.3.39 - 2023-10-17

### Fix

- Mobile header pre-filter selected UI

## 0.3.38 - 2023-10-17

### Added

- Inquiry flow
- Change font
- New product card UI
- Add Cadenas 3d web viewer

## 0.3.37 - 2023-09-20

### Fixed

- Pass pre-filter on mobile image search

## 0.3.36 - 2023-09-05

### Added

- Multiple pre-filter
- RFQ
## 0.3.35 - 2023-06-27

### Fixed

- CTA button clickable when there is no cta link

## 0.3.34 - 2023-06-27

### Added

- New landing page UI
- Search bar UI improvements
- post-filter & pre-filter
- show group enable/disable through settings
- Cropper info message
- Analytics 
## 0.3.33 - 2023-06-27

### Removed

- Removed HEIC support
### Fixed

- Products with null group_id is not showing
## 0.3.32 - 2023-06-27

### Fixed

- HEIC formatted image is not working
## 0.3.31 - 2023-06-16

### Added

- Add padding in cropper grip
- Info text based on score
### Fixed

- Cropper grip is not rounded
## 0.3.30 - 2023-05-15

### Added

- Added new crop box UI
- Added field mappings
## 0.3.29 - 2023-04-29

### Fixed

- Fixed results not showing when there are two visual search matches
- Fixed mobile camera is sending full image for visual search

## 0.3.28 - 2023-04-19

### Added

- Link product cta to product_link


## 0.3.27 - 2023-04-18

### Added

- Added translation for multiple labels - NYRIS-5627
### Fixed

- Fixed detail item modal feedback buttons are not centered


## 0.3.26 - 2023-04-17

### Fixed

- Fixed object detection appearing twice NYRIS-5625

## 0.3.25 - 2023-04-14

### Added

- Added internationalization support
- Added enable/disable for share option 

## 0.3.24 - 2023-04-12

### Removed

- Purged Material design support
- Removed unused routes and pages
- Removed unused components
- Removed unused settings

## 0.3.23 - 2023-04-11

### Added

- Added text search support using algolia & react InstantSearch
- Added pre-filter feature
- Added post-filter feature
- Changed landing page UI
- Changed product card UI
- Added warehouse variant product card UI
- Added zoom in/out capabilities for the camera view


# Changelog

## v0.10.0

Added
---------
- Introduced LapService for managing lap data.
- Added functionality to track active stints and pits.
- Implemented fuel duration adjustment in the fuel component.

Changed
---------
- Updated RaceLogicService to calculate average stint times using pit data.
- Modified data models to allow undefined timestamps for exit times.

---

## v0.9.0

Added
---------
- Introduced a form to change fuel duration in minutes.
- Added calculation for remaining laps based on fuel.
- Implemented RaceLogicService for calculating average stint times.

Changed
---------
- Improved fuel component to handle undefined dates gracefully.
- Updated UI elements for better user interaction and display.

---

## v0.8.0

Added
---------
- Introduced a new Battery component with dynamic charge level indicator
- Introduced a new Fuel component with dynamic consumption tracking

Changed
---------
- Improved app layout with dark theme and grid system
- Improve Tyre Change Window  and Race component with reactive interval

---

## v0.7.0

**Added**
---------
- Introduced a new Tyre Change Window component with countdown functionality.
- Added date-fns library for date manipulation.

**Changed**
---------
- Updated race component to use a new countdown calculation method.
- Improved pit service logic for filtering race pits.

---

## v0.6.0

**Added**
---------
- Introduced a new Tyre Change Window component to manage tyre changes during races.
- Added functionality to track remaining tyre changes and display opening/closing times.

**Changed**
---------
- Updated services to support active race data and improve data filtering.
- Enhanced UI with new components and layout adjustments.

---

## v0.5.0

**Added**
---------
- Introduced a new RaceComponent to manage race operations and display active race time.
- Implemented RaceConfigService for race configuration settings.
- Added BaseService to handle common service functionalities.

**Changed**
---------
- Updated RaceService to extend BaseService and manage active races.
- Modified data models to include a 'deleted' flag for soft deletion.
- Refactored services to extend a new FirestoreService for improved code reuse and maintainability.
- Updated service methods to use common data handling functions from FirestoreService.
- Removed redundant code and console logs from service implementations.

---

## v0.4.0

**Added**
---------
- Introduced new services for managing drivers, stints, races, and pits using Firestore.
- Updated the app component to utilize the new DriverService.

**Changed**
---------
- Modified data models to use string IDs instead of numbers.
- Updated .gitignore to include Codium AI files.

---

## v0.3.0

**Added**
---------
- Add GitHub Pages deployment configuration
- Add Tailwind CSS configuration and dependencies
- Add Firebase configuration

---

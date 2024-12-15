# Changelog

## v0.15.0

Added
-------
- Introduced a new Pit Lane component with enhanced functionalities for managing pit stops.
- Added a Stint Optimizer component to optimize race strategies.
- Implemented a Driver Change component to monitor driver changes.

Changed
---------
- Updated the Race component to allow selection of the starting driver.
- Enhanced the Driver component to display the number of stints completed by each driver.

----

## v0.14.0

Added
-------
- Introduced a new Pit Lane component with UI for managing pit stops, driver changes, and refueling.
- Implemented RaceManagerService and PitLaneService for handling race and pit lane logic.


Changed
---------
- Updated services to return created entities and refactored lifecycle management.
- Enhanced driver and race components with new functionalities and UI improvements.

----

## v0.13.0

Added
-------
- Introduced a new Driver component to display drivers, reference lap and time on track.
- Added lap time formatting with milliseconds precision.

Changed
---------
- Improved layout with visual separators.
- Improved race logic calculations by removing dependency on LapService and using race configuration for reference lap time.
- Updated fuel service to use race configuration for reference lap time.
- Minor text adjustment in fuel component UI.

Fix
------
- Correct average stint time calculation for remaining driver changes.

---

## v0.12.0

Added
---------
- Introduced a new Race Logic component to display average stint times and laps.
- Added utility functions for time conversion in the date utility module.

Changed
---------
- Refactored race logic calculations to improve accuracy and performance.
- Updated the app layout to include the new Race Logic component.

---

## v0.11.0

Added
---------
- Introduced FuelService for managing fuel data.
- Introduced TyreService for managing tyre data.
- 

Changed
---------
- Migrated RaceConfigService to use firestore
- Improved data handling to signal

---

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

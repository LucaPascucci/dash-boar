# Changelog

## v0.21.0

Added
---------
- Introduced a new Timeline feature to visualize race events.
- Implemented a Tooltip component for enhanced UI interaction.

Changed
---------
- Updated driver selection logic for pit stops.

---

## v0.20.0

Added
---------
- Introduced DeltaStintComponent to display delta stints with time tracking.
- Implemented DeltaStintService for managing delta stint calculations.

Changed
---------
- Updated app layout to include DeltaStintComponent.
- Removed unused imports and optimized existing components.

---

## v0.19.0

Added
---------
- Introduced an "Optimum" column in the stint component to display optimized stint times.
- Added functionality to calculate and display optimized stint times using the StintOptimizerService.
- Added a new column to the driver table to show the time from the last stint.
- Added a new component to manage the reference lap time.

Changed
---------
- Updated the driver table to remove the reference lap time column.
- Updated table headers and data cells to use smaller text sizes for better readability.
- Refactored race and pit services to improve stint management and calculation logic.

---

## v0.18.0

Added
---------
- Introduced AudioService for handling audio playback in the application.

Changed
---------
- Updated duration formatting to use '--:--:--' for negative values.
- Simplified calculation logic for total refueling and tyre changes.
- Modified active stint display to show '0' instead of '--:--:--' when inactive.

---

## v0.17.0

Added
---------
- Introduced a new UI component for displaying pit information, including tables for pit details and totals.
- Implemented functions to calculate total pit time, refueling, and tyre changes.
- Integrated PitService for managing pit data and state.

Changed
---------
- Improved table layout and scrolling for stint and driver components.
- Enhanced time calculation and warning logic for drivers.
- Updated data sorting and configuration settings.

---

## v0.16.0

Added
-------
- Introduced StintOptimizerService for optimized stint calculations.
- Added new components for active stint and stint management.
- Implemented new functionalities for managing race configurations and pit operations.

Changed
---------
- Refactored existing services and components to improve race and stint management.
- Updated UI layout and component interactions for better user experience.

---

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

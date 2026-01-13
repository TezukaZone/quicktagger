# QuickTagger

A StashApp plugin that adds quick scene tagging functionality. Injects a button into the scenes page list operations that opens a modal with configurable tag buttons for batch tagging scenes.

## Features

- **Quick Tag Button**: Adds a "Quick Tag" button to the scenes page operations bar
- **Batch Tagging**: Apply tags to multiple selected scenes at once
- **Configurable Tag Buttons**: Define your own tag buttons with custom labels

## Installation

### Prerequisites

- StashApp (v0.20.0 or later recommended)
- [CommunityScriptsUILibrary](https://github.com/stashapp/CommunityScripts/tree/master/plugins/CommunityScriptsUILibrary) plugin

### Steps

1. **Install CommunityScriptsUILibrary first** (if not already installed)

2. **Install QuickTagger**
   - Download or clone this repository
   - Symlink to your Stash plugins directory:
     ```bash
     ln -s /path/to/QuickTagger/plugins/quickTagger ~/.stash/plugins/quickTagger
     ```

3. **Reload Plugins**
   - Open Stash
   - Go to **Settings > Plugins**
   - Click **Reload plugins**
   - Verify "QuickTagger" appears in the installed plugins list

## Usage

### Basic Usage

1. Navigate to the **Scenes** page in Stash
2. Select one or more scenes using the checkboxes
3. Click the **Quick Tag** button in the operations bar
4. Click a tag button in the modal to apply that tag to all selected scenes

### Configuration

To configure your tag buttons:

1. Go to **Settings > Plugins**
2. Find **QuickTagger** in the installed plugins list
3. Click **Configure**
4. Edit the `tagButtons` setting in JSON format:
   ```json
   [
     {"id": "123", "label": "Favorite"},
     {"id": "456", "label": "To Watch"},
     {"id": "789", "label": "HD"}
   ]
   ```

5. **Finding Tag IDs**:
   - Go to **Tags** page in Stash
   - Click on a tag to view it
   - The tag ID is in the URL (e.g., `/tags/123` where `123` is the ID)

6. Save the configuration and refresh the Scenes page

## License

AGPL-3.0

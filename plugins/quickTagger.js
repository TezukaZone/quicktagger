// QuickTagger - StashApp Plugin for Quick Scene Tagging
(function () {
  // Wait for CommunityScriptsUILibrary to load
  const initPlugin = () => {
    if (!window.csLib) {
      setTimeout(initPlugin, 100);
      return;
    }

    const PluginApi = window.PluginApi;
    const React = PluginApi.React;
    const { Button, Modal } = PluginApi.libraries.Bootstrap;

    const PLUGIN_ID = 'quickTagger';

    // Store selected scene IDs
    let selectedSceneIds = [];

    // Default configuration
    const defaultConfig = {
      tagButtons: []
    };

    // GraphQL mutation to bulk update scene tags
    const bulkUpdateTags = async (sceneIds, tagIds) => {
      const mutation = `
        mutation BulkSceneUpdate($input: BulkSceneUpdateInput!) {
          bulkSceneUpdate(input: $input) {
            id
          }
        }
      `;

      try {
        const response = await csLib.callGQL({
          query: mutation,
          variables: {
            input: {
              ids: sceneIds,
              tag_ids: {
                mode: 'ADD',
                ids: tagIds
              }
            }
          }
        });
        return response.bulkSceneUpdate;
      } catch (error) {
        console.error('[QuickTagger] Error updating tags:', error);
        throw error;
      }
    };

    // QuickTag Button Component
    const QuickTagButton = ({ onClick, disabled, count }) => {
      return React.createElement(Button, {
        variant: 'success',
        size: 'sm',
        className: 'quicktagger-button',
        onClick: onClick,
        disabled: disabled || count === 0
      }, `Quick Tag${count > 0 ? ` (${count})` : ''}`);
    };

    // Tag Button Component
    const TagButton = ({ label, onClick, applying }) => {
      return React.createElement(Button, {
        variant: 'outline-primary',
        size: 'sm',
        className: 'quicktagger-tag-button',
        onClick: onClick,
        disabled: applying
      }, label);
    };

    // Modal Component
    const QuickTagModal = ({ show, onHide, sceneCount, tagButtons, onApplyTag }) => {
      const [applying, setApplying] = React.useState(false);

      const handleTagClick = async (tagId) => {
        setApplying(true);
        try {
          await onApplyTag(tagId);
          onHide();
        } catch (error) {
          alert('Failed to apply tags: ' + error.message);
          setApplying(false);
        }
      };

      return React.createElement(Modal, {
        show: show,
        onHide: onHide,
        centered: true,
        className: 'quicktagger-modal'
      },
        React.createElement(Modal.Header, {
          closeButton: true,
          closeLabel: 'Close'
        },
          React.createElement(Modal.Title, null, `Quick Tag (${sceneCount} scenes)`)
        ),
        React.createElement(Modal.Body, null,
          tagButtons.length === 0
            ? React.createElement('div', { className: 'quicktagger-empty-state text-center p-4' },
                React.createElement('p', null, 'No tag buttons configured.'),
                React.createElement('p', { className: 'text-muted' },
                  'Go to Settings > Plugins > QuickTagger to configure tag buttons.'
                )
              )
            : React.createElement('div', { className: 'quicktagger-tag-grid' },
                tagButtons.map((button, index) =>
                  React.createElement(TagButton, {
                    key: index,
                    label: button.label,
                    onClick: () => handleTagClick(button.id),
                    applying: applying
                  })
                )
              )
        ),
        React.createElement(Modal.Footer, null,
          React.createElement(Button, {
            variant: 'secondary',
            onClick: onHide,
            disabled: applying
          }, 'Cancel')
        )
      );
    };

    // Main Plugin Component
    const QuickTaggerPlugin = () => {
      const [showModal, setShowModal] = React.useState(false);
      const [config, setConfig] = React.useState(defaultConfig);
      const [sceneCount, setSceneCount] = React.useState(0);

      // Load configuration on mount
      React.useEffect(() => {
        const loadConfig = async () => {
          try {
            const savedConfig = await csLib.getConfiguration(PLUGIN_ID, defaultConfig);
            // Parse tag buttons if stored as JSON string
            let tagButtons = savedConfig.tagButtons || [];
            if (typeof tagButtons === 'string') {
              try {
                tagButtons = JSON.parse(tagButtons);
              } catch (e) {
                tagButtons = [];
              }
            }
            setConfig({
              ...defaultConfig,
              ...savedConfig,
              tagButtons
            });
          } catch (error) {
            console.error('[QuickTagger] Error loading config:', error);
          }
        };
        loadConfig();
      }, []);

      // Update scene count from selection
      React.useEffect(() => {
        const updateSelection = () => {
          // Get selected IDs from Stash's scene list state
          const checkboxes = document.querySelectorAll('.scene-list .batch-check:checked');
          selectedSceneIds = Array.from(checkboxes).map(cb => cb.value);
          setSceneCount(selectedSceneIds.length);
        };

        updateSelection();

        // Listen for checkbox changes
        document.addEventListener('change', updateSelection);
        return () => {
          document.removeEventListener('change', updateSelection);
        };
      }, []);

      const handleOpenModal = () => {
        if (selectedSceneIds.length > 0) {
          setShowModal(true);
        }
      };

      const handleApplyTag = async (tagId) => {
        await bulkUpdateTags(selectedSceneIds, [tagId]);
        // Refresh the scene list
        window.location.reload();
      };

      return React.createElement(React.Fragment, null,
        React.createElement(QuickTagButton, {
          onClick: handleOpenModal,
          count: sceneCount
        }),
        React.createElement(QuickTagModal, {
          show: showModal,
          onHide: () => setShowModal(false),
          sceneCount: sceneCount,
          tagButtons: config.tagButtons || [],
          onApplyTag: handleApplyTag
        })
      );
    };

    // Inject button into SceneList operations
    PluginApi.patch.before('SceneList.StatusButtons', (props) => {
      return [{
        children: React.createElement(React.Fragment, null,
          props.children,
          React.createElement(QuickTaggerPlugin, null)
        )
      }];
    });

    console.log('[QuickTagger] Plugin initialized');
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlugin);
  } else {
    initPlugin();
  }
})();

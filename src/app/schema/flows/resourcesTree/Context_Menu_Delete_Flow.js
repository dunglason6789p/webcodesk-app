export default [
  {
    type: 'component',
    props: {
      componentName: 'applicationStartWrapper',
      componentInstance: 'wrapperInstance',
    },
    events: [
      {
        name: 'onApplicationStart',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.appInitializationMethods.initApplication'
            },
            events: [
              {
                name: 'mainWindowMessage',
                targets: [
                  {
                    type: 'userFunction',
                    props: {
                      functionName: 'usr.api.mainWindowMessageMethods.processMainWindowMessage',
                    },
                    events: [
                      {
                        name: 'removeFlow',
                        targets: [
                          {
                            type: 'userFunction',
                            props: {
                              functionName: 'usr.api.resourcesTreeViewMethods.removeFlowStart',
                            },
                            events: [
                              {
                                name: 'isDialogOpen',
                                targets: [
                                  {
                                    type: 'component',
                                    props: {
                                      componentName: 'usr.components.dialogs.DeleteFlowDialog.DeleteFlowDialog',
                                      componentInstance: 'deleteFlowDialog1',
                                      propertyName: 'isOpen'
                                    },
                                    events: [
                                      {
                                        name: 'onClose',
                                        targets: [
                                          {
                                            type: 'component',
                                            props: {
                                              componentName: 'usr.components.dialogs.DeleteFlowDialog.DeleteFlowDialog',
                                              componentInstance: 'deleteFlowDialog1',
                                              propertyName: 'isOpen'
                                            }
                                          },
                                        ]
                                      },
                                    ]
                                  }
                                ]
                              },
                              {
                                name: 'resource',
                                targets: [
                                  {
                                    type: 'component',
                                    props: {
                                      componentName: 'usr.components.dialogs.DeleteFlowDialog.DeleteFlowDialog',
                                      componentInstance: 'deleteFlowDialog1',
                                      propertyName: 'resource'
                                    },
                                  }
                                ]
                              },
                              {
                                name: 'resourceName',
                                targets: [
                                  {
                                    type: 'component',
                                    props: {
                                      componentName: 'usr.components.dialogs.DeleteFlowDialog.DeleteFlowDialog',
                                      componentInstance: 'deleteFlowDialog1',
                                      propertyName: 'resourceName'
                                    },
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
        ]
      }
    ]
  }
]
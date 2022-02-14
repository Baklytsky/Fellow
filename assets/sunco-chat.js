
        const delegate = {
          beforeDisplay(message, data) {
            if (message.metadata && message.metadata.isHidden) {
              return null;
            }

            return message;
          }
        };
      
    
  Smooch.init({ integrationId: '6182f7e81f6e6500e1d1c2d5',
                          
             businessName: 'Fellow',
             businessIconUrl: 'https://cdn.shopify.com/s/files/1/0057/6235/1219/files/jQ7x7lpg.png?v=1633544966',
             customColors: {
        brandColor: '000000',
        conversationColor: '000000',
        actionColor: '000000',
    },
            delegate 
           
            });
  
  Smooch.on('widget:opened', function () {
          console.log('Widget is opened!');
          var conversation = Smooch.getDisplayedConversation();
          if (conversation == null){
            Smooch.createConversation({
              displayName: "Fellow Chat",
            }).then((conversation) => {
              Smooch.sendMessage(
              {
                type: 'text',
                text: 'start over',
                metadata: {
                  isHidden:true
                }
              },
                {
              type: 'text',
              text: 'I didnt get that. Try rephrasing your question or start over.',
              metadata: {
                isHidden:true
              }
            },
              conversation.id,
              );

            });
          }
          else{
            Smooch.sendMessage(
            {
              type: 'text',
              text: 'start over',
              metadata: {
                isHidden:true
              }
            },
                    {
              type: 'text',
              text: 'I didnt get that. Try rephrasing your question or start over.',
              metadata: {
                isHidden:true
              }
            },
            conversation.id,
          );

          }
          
        });

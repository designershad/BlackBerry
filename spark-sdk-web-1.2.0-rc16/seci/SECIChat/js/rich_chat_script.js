//****************************************************************************
// Copyright 2018 BlackBerry.  All Rights Reserved.
//
// You must obtain a license from and pay any applicable license fees to
// BlackBerry before you may reproduce, modify or distribute this software, or
// any work that includes all or part of this software.
//

/**
 * SECI chat.
 *
 * @class RichChat
 * @memberof Examples
 */

/* ------------- NOTE: The localStorage fields used in the app ------------- */
// 1. localStorage.userID:
// Put user ID (provided by oAuth service) to localStorage to decide if the
// login screen needs to show up when localStorage is expired
/* ------------------------------- NOTE END -------------------------------- */

// Prefix names for data binding.
var DATA_BIND_PREFIX = 'data-bind-';
var DATA_BIND_PREFIX_CONTACT = 'contact-';
var DATA_BIND_PREFIX_CHAT = 'chat-';

// Prefix ids for UI element.
var PREFIX_ID_CHAT_LIST_ROW = 'chatRow-';

// Names of attributes for data binding.
var DATA_CONTACT_NAME = 'contactName';
var DATA_CONTACT_IMG_URL = 'contactImageURL';
var DATA_CHAT = 'chatData';

// The max number of files to send in one drag and drop. This is for example
// purposes and for consistency with mobile. It can be increased or removed.
var MAX_FILES_SEND = 10;

// BBMEnterprise holds the information that describes a user account.
// BBMEnterprise.Messenger provides higher level functionality used to manage
// chats.
var bbmeSdk;
var messenger;

// User information.
var userEmail;
var userName;
var userAvatarURL;

// BBM related information after the registration and setup are completed.
var userRegId;
var userPin;
var regState;

// Used to track if KMS sync was started.
var isSyncStarted;

// The Id of the selected chat from the list on the chat tab.
var selectedChatId;

// A map to store all chats data from the BBM Enterprise SDK.
var chatsMap = {};

// Instance of bbm-call widget.
var bbmCallWidget;

// Tracks information about contact list changes. Provides information about
// contacts in user's contact list.
var contactsManager;
var messageFormatter;

function reportValidationError(error) {
  console.log('Failed to init the BBM Enterprise SDK: ' +
              `${error} in UA: ${navigator.userAgent}`);
  // Don't let user to login.
  $('#loginBtnDiv').hide();
  if (error instanceof BBMEnterprise.Error.BrowserNotSupportedError) {
    // Give a hint that it might be because it's server over http.
    if(window.isSecureContext === false) {
      showRegistrationFailure('This page must be served over https');
    } else {
      showRegistrationFailure('Unsupported Browser');
    }
  } else {
    showRegistrationFailure('Failed to initialize the BBM Enterprise SDK');
  }
}

try {
  // First validate this is running on a browser with the required features.
  // This is done now since IE will fail in an uglier less user friendly way
  // during the sign in process and wouldn't get to the browser check later.
  // Also it is not very user friendly to let the user login now then tell them
  // their browser is not supported after.
  BBMEnterprise.validateBrowser()
  // Init the login process.
  .then(loginIfSessionExists)
  .catch(reportValidationError);
} catch (error) {
  reportValidationError(error);
}

//#region Login/Logout/Authentication functions

/*
 * Function initiates user log in.
 * 1. Acquires access token and user info from customer auth service.
 * 2. Sign in user to BBM.
 */
function logIn() {
  // First check for mandatory config.
  const missing = [];
  if (typeof createUserManager !== 'function') {
    missing.push('createUserManager()');
  }
  if (typeof createAuthManager !== 'function') {
    missing.push('createAuthManager()');
  }
  if (missing.length > 0) {
    var missingMessage = missing.join(', ');
    console.log(`You must define ${missingMessage} in the config.js`);
    showRegistrationFailure(`${missingMessage} not defined.`);
    $('#loginBtnDiv').show();
    return;
  }

  const authManager = createAuthManager();
  authManager.authenticate()
  .then(userInfo => {
    // Set local storage user Id.
    localStorage.userID = userInfo.id;
    userName = userInfo.displayName;
    userEmail = userInfo.email;
    userAvatarURL = userInfo.avatarUrl;
    // Create the user manager that is defined in config.js, pass the user info
    // from the auth system.
    BBMSignIn(userInfo, authManager);
  })
  .catch(error => {
    console.error(`Login error: ${error}`);
    showRegistrationFailure(`Failed to authenticate. Error: ${error}`);
    $('#loginBtnDiv').show();
  });
}

// Using localStorage to start connection with the servers for a user who is
// already logged in.
function loginIfSessionExists() {
  var userID = localStorage.userID;

  // Clean up the login status field.
  $('#loginStatus').html('');

  // Update the header.
  $('#headerText').html('Rich Chat');

  // Keep hiding the main screen and setting pane during the login process.
  $('#settingsPane').hide();
  $('#mainScreen').hide();
  $('#signInButton').click(logIn);

  if (userID != undefined) {
    $('#loginStatus').html('Automatically logging in. Check your browser is '
      + 'not blocking popup windows.');
    logIn();
  }
  else {
    $('#loginBtnDiv').show();
  }
}

/**
 * @typedef {object} UserPasswordInfo
 * @property {string} password The password.
 * @property {boolean} isNew true - if user created the new password. false - if
 * user provided the existing password.
 */

/**
 * Callback function shows dialog for user to enter new or existing password.
 * @param {boolean} isNewPassword True if user is requested to enter new
 * password. False if user is requested to enter existing password.
 * @returns {Promise<UserPasswordInfo>} Resolves with the password information
 */
function getUserSecret(isNewPassword) {
  return new Promise((resolve, reject) => {
    const dialog = document.createElement("bbm-chat-user-password");
    dialog.isNewPassword = isNewPassword;
    dialog.isPasswordFailed = isSyncStarted;
    document.body.appendChild(dialog);
    dialog.addEventListener('OnOk', e => {
      const password = e.detail;
      dialog.parentNode.removeChild(dialog);
      // User will be prompted to enter password again if import is failed.
      resolve({
        password: password,
        isNew: dialog.isNewPassword
      });
    });
    dialog.addEventListener('OnCancel', () => {
      // User decided not to enter any keys. Setup will be canceled.
      dialog.parentNode.removeChild(dialog);
      reject();
    });
    dialog.addEventListener('OnReset', () => {
      dialog.parentNode.removeChild(dialog);
      getUserSecret(true)
      .then(pw => resolve(pw))
      .catch(error => reject(error));
    });
  });
}

/**
 * Sign in to to BBM after authorization is done.
 * @param {Support.Auth.genericAuthHelper.GenericUserInfo} authUserInfo
 *   User profile information after you have authorization completed.
 */
function BBMSignIn(authUserInfo, authManager) {
  if (!authUserInfo || !authManager) {
    $('#loginStatus').html('Sign in failed.');

    // Show the login pane to let the user retry
    $('#loginPane').show();
  }
  else {
    // Hide login button but still show the status field
    $('#loginBtnDiv').hide();

    // Update the login status field
    $('#loginStatus').html('Registering BBM Enterprise ...');

    try {
      // Construct BBMEnterprise.Messenger which provides higher level
      // functionality used to manipulate and annotate chats. It is configured
      // to use BBME Key Provider Server.
      bbmeSdk = new BBMEnterprise({
        domain: ID_PROVIDER_DOMAIN,
        environment: ID_PROVIDER_ENVIRONMENT,
        userId: authUserInfo.userId,
        getToken: authManager.getBbmSdkToken,
        description: navigator.userAgent,
        messageStorageFactory: BBMEnterprise.StorageFactory.SpliceWatcher,
        kmsArgonWasmUrl: KMS_ARGON_WASM_URL
      });
    } catch (error) {
      console.log('Failed to init the BBM Enterprise SDK: ' +
                  `${error} in UA: ${navigator.userAgent}`);
      if (error instanceof BBMEnterprise.Error.BrowserNotSupportedError) {
        showRegistrationFailure('Unsupported Browser');
        return;
      }
      showRegistrationFailure('Failed to initialize the BBM Enterprise SDK');
    }

    // Listen to the related registration callback event.
    bbmeSdk.on('registrationChanged', onRegistrationError);

    // When our app gets focus, we can reasonably assume that the user is
    // interested in activity.  Allow any activity suspended by temporary
    // failures to now resume.
    //
    // We use the focus event on the browser window here because we want all
    // events of the browser coming into focus.  These include:
    // 1. The tab coming to the foreground in the browser.
    // 2. The browser window returning from being minimized.
    // 3. The browser window regaining focus.
    //
    // This event is selected because it is a reasonable approximation of a
    // user's direct interest in interacting with the application and it's an
    // event that isn't overly aggressive.
    $(window).on('focus', () => {
      console.log('Application has regained focus');
      bbmeSdk.retryServerRequests();
    });

    // Use a promise to make sure that some of the event callbacks only should
    // be processed after the setup is finished. The main reason for this is to
    // know the local user's regID before processing the event callbacks.
    const setupComplete = new Promise(resolve => {
      // Listen to all chat related callback events. Wait until setup completes
      // and then process chatAdded event for chat.
      bbmeSdk.messenger.on('chatAdded', chatAddedEvent => {
        setupComplete.then(() => {
          // Only process the new chat after setup completes.
          const chat = chatAddedEvent.chat;
          console.log(`SECI CHAT: chatAdded - chat Id: ${chat.chatId}`);
          addChatElement(chat);
        });
      });

      // Wait until setup completes and then process chatUpdated event for chat
      bbmeSdk.messenger.on('chatUpdated', chatUpdatedEvent => {
         setupComplete.then(() => {
          // Only process the chat update after setup completes
          var chat = chatUpdatedEvent.chat;
          console.log(`SECI Chat: chatUpdated - chat Id: ${chat.chatId}`);
          updateChatElement(chat);
        });
      });

      // For the events below, for now, we don't need to wait until setup
      // completes.
      bbmeSdk.messenger.on('chatRemoved', chatRemovedEvent => {
        const chat = chatRemovedEvent.chat;
        console.log(`SECI Chat: chatRemoved - chat Id: ${chat.chatId}`);
        removeChatElement(chat);
      });

      // Listen for new messages to show a notification and update the new
      // message count.
      bbmeSdk.messenger.on('chatMessageAdded', chatMessage => {
        console.log(
          `SECI Chat: chatMessageAdded - chatId: ${chatMessage.message.chatId}`
          + ` messageId: ${chatMessage.message.messageId}`);

        // Show a notification that a new message has arrived.
        if (chatMessage.message.isIncoming) {
          showNotification(chatMessage);
        }
        updateChatElement(bbmeSdk.messenger.getChat(chatMessage.message.chatId));
      });

      // Listen for message updates to update the new message count.
      bbmeSdk.messenger.on('chatMessageUpdated', chatMessage => {
        console.log(
          `SECI Chat: chatMessageUpdated - chatId: ${chatMessage.message.chatId}`
          + ` messageId: ${chatMessage.message.messageId}`);
        updateChatElement(bbmeSdk.messenger.getChat(chatMessage.message.chatId));
      });

      // Handle setup state changes.
      bbmeSdk.on('setupState', state => {
        console.log(`SECI Chat: BBMEnterprise setup state: ${state.value}`);
        switch (state.value) {
          case BBMEnterprise.SetupState.Success: {
            isSyncStarted = false;
            regState = 'Success';
            const registrationInfo = bbmeSdk.getRegistrationInfo();
            // Save local user reg id.
            userRegId = registrationInfo.regId;
            createUserManager(userRegId, authManager,
              bbmeSdk.getIdentitiesFromAppUserId,
                bbmeSdk.getIdentitiesFromAppUserIds)
            .then(userManager => {
              contactsManager = userManager;
              // Sign up to contactsManager events to track changes in user
              // contact list.
              const contactList = document.getElementById('bbmContactList');
              contactList.setContactManager(contactsManager);
              messenger = bbmeSdk.messenger;
              contactsManager.addEventListener('user_added', onUserInfo);
              contactsManager.addEventListener('user_changed', onUserInfo);
              // Put oAuth user ID to localStorage to decide if the login
              // screen needs to show up when localStorage is expired.
              localStorage.userID = authUserInfo.userId;
              // Set the values to the local variables used by the web page.
              userPin = registrationInfo.pin;
              // Make a rounded image for the user avatar.
              $('.headerBanner img').css('border-radius', '50%');
              // At this point, it can make sure the registration has been
              // finished and then initialize the main screen, otherwise show
              // "BBM Enterprise registration failed." on the login screen.
              contactsManager.initialize()
              .then(() => {
                $('#loginStatus').innerHTML =
                  'BBM Enterprise registration completed';
                // Hide login pane.
                $('#loginPane').hide();
                // Show the main screen.
                $('#mainScreen').css('display', '');
                // Setup listeners for incoming calls and data transfers.
                if (bbmeSdk.media) {
                  bbmeSdk.media.on('incomingCall', handleIncomingCall);
                }
                initMainScreen();
                resolve();
              });
            });
          }
          break;
          case BBMEnterprise.SetupState.SyncRequired: {
            const isNew =
              bbmeSdk.syncPasscodeState === BBMEnterprise.SyncPasscodeState.New;
            getUserSecret(isNew)
            .then(result => {
              const password = result.password;
              const syncAction = result.isNew
                ? BBMEnterprise.SyncStartAction.New
                : BBMEnterprise.SyncStartAction.Existing;
              bbmeSdk.syncStart(password, syncAction);
            })
            .catch(() => {
              $('#loginStatus').html('Failed to get user password.');
              logout();
            });
          }
          break;
          case BBMEnterprise.SetupState.SyncStarted:
            $('#loginStatus').html('Synchronizing with KMS ...');
            isSyncStarted = true;
          break;
          case BBMEnterprise.SetupState.Ongoing:
            $('#loginStatus').html('BBM Enterprise setup is in progress ...');
          break;
          case BBMEnterprise.SetupState.NotRequested:
            $('#loginStatus').html('');
          break;
        }
        return undefined;
      });

      // Handle setup error.
      bbmeSdk.on('setupError', error => {
        showRegistrationFailure(`BBM Enterprise registration failed: ${error}`);
        isSyncStarted = false;
      });

      bbmeSdk.setupStart();
    });
  }
}

/**
 * The callback function for "registrationChanged" event.
 * @param {object} registrationChangedEvent
 * The event to provide state(Success | Failure), regId and pin
 */
function onRegistrationError(registrationChangedEvent) {
  regState = registrationChangedEvent.state;
  if (regState === 'Success') {
    return;
  }
  // We have a failure, figure out what message we should display.
  let message = null;
  switch (registrationChangedEvent.failureReason) {
  case BBMEnterprise.Event.RegistrationChanged.Failure.DeviceSwitchRequired:
    message = `<p>BBM Enterprise registration failed.</p>`
            + `<p>Another client that does not support multiple points of `
            + `presence is currently registered for the account with BBM `
            + `Registration ID: ${registrationChangedEvent.regId} `
            + `and PIN: ${registrationChangedEvent.pin}.</p>`
            + `<p>Please sign in with with a mobile client that supports `
            + `converting your account to support multiple points of `
            + `presence.<p/>`;
    break;

  case BBMEnterprise.Event.RegistrationChanged.Failure.RegistrationRevoked:
    message = `<p>BBM Enterprise registration failed.</p>`
            + `<p>The account with BBM Registration ID: `
            + `${registrationChangedEvent.regId} and PIN: `
            + `${registrationChangedEvent.pin} has had its registration `
            + `revoked. It is likely that too many clients have been signed `
            + `in for this account.</p>`
            + `<p>Please logout and log back in to resume using this `
            + `application instance.</p>`;
    break;

  case BBMEnterprise.Event.RegistrationChanged.Failure.FailedToImportProfileKeys:
    message = `<p>BBM Enterprise registration failed.</p>`
            + `<p>The account with BBM Registration ID: `
            + `${registrationChangedEvent.regId}`
            + ` failed to import profile keys with provided password.</p>`
            + `<p>Please try again and choose the Reset Password option `
            + `if needed.</p>`;
    break;

  default:
    if (registrationChangedEvent.regId !== undefined) {
      message = `<p>BBM Enterprise registration failed.</p>`
              + `<p>Unable to complete registration for account with BBM `
              + `Registration ID: ${registrationChangedEvent.regId} `
              + `and PIN: ${registrationChangedEvent.pin}.</p>`;
    }
    break;
  }

  showRegistrationFailure(message);
}

/**
 * Show an error message for a registration failure.  This function ensures
 * that only the login screen is shown with the registration error message.
 * All other screen views are hidden.
 *
 * @param {string} message
 * The HTML error message to be displayed.  When the message is falsy, a generic
 * error message will be displayed, otherwise, the message as given will be
 * displayed.
 */
function showRegistrationFailure(message) {
  $('#loginPane').show();
  // Hide the main screen and settings.
  $('#mainScreen').hide();
  $('#settingsPane').hide();
  $('#loginStatus').html(message || 'BBM Enterprise registration failed.');
}

/**
 * Initialize the chat list.
 */
function initChatList() {
  messenger.getChats().forEach(chat => {
    try {
      addChatElement(chat);
    } catch (error) {
      console.log(`Error adding chat element: ${error}`);
    }
  });
}

/**
 * Leave a chat.
 * @param {string} chatId The id of the chat to leave.
 */
function leaveChat(chatId) {
  messenger.chatLeave(chatId).then(() => {
    // Clear the existing highlighted row from the chat list
    $('#' + createChatRowElementId(selectedChatId)).toggleClass('selected');
    // Set the default place holder on the conversation pane
    $('#contentPanePlaceHolder').show();
    $('#conversationPane').hide();
    document.getElementById('contentPanePlaceHolderImg').src
      = './images/no_chats_guy.png';
    document.getElementById('contentPanePlaceHolderText').innerHTML
      = 'No chat selected.';
    // Clear selectedChatId to empty
    selectedChatId = '';
  });
}

/**
 * Show confirm message to logout.
 */
function showLogoutDialog() {
  // Get a flag to indicate whether or not we should proceed with the logout.
  var doLogout = (regState === 'Success'
                  // The user is currently registered, confirm that they wish
                  // to logout.
                  ? confirm('Do you really want to logout?')
                  // The user is not currently registered, just let them logout
                  // without any hassle.
                  : true);
  if (doLogout) {
    logout();
  }
}

/**
 * Logout SECIChat.
 */
function logout() {
  regState = undefined;
  // Remove the listener on the window that controls our interest in the
  // browser's focus.
  $(window).off('focus');
  // Proceed with removing our login session and resetting the UI.
  removeLoginSession();
  $('#loginPane').show();
  // Hide the main screen and settings.
  $('#mainScreen').css('display', 'none');
  $('#settingsPane').css('display', 'none');
}

/**
 * Do the log out process for google.
 */
function removeLoginSession() {
  // Clean up the userID from the localStorage to show the login screen.
  localStorage.removeItem('userID');
  console.log('SECI Chat: User signed out.');
  $('#loginBtnDiv').show();
  $('#loginStatus').html('');

  try {
    // Clear the chat widget.
    const bbmChat = document.querySelector('#conversationPane');
    bbmChat.setContactManager(undefined);
    bbmChat.setBbmSdk(undefined);
    bbmChat.setTimeRangeFormatter(undefined);
    bbmChat.setMessageFormatter(undefined);

    // Clear the contact list.
    const contactList = document.querySelector('#bbmContactList');
    const chatList = document.querySelector('#chatListContainer');
    contactList.setContactManager(undefined);
    contactList.style.display = 'none';
    chatList.style.display = 'block';

    // Clear chat list.
    const chatIds = Object.keys(chatsMap);
    chatIds.forEach(chatId => {
      const chat = bbmeSdk.messenger.getChat(chatId);
      removeChatElement(chat);
    });

    // Stop call.
    if (bbmCallWidget) {
      document.body.removeChild(bbmCallWidget);
    }

    bbmeSdk.shutdown();
    bbmeSdk = undefined;
    messenger = undefined;
    contactsManager = undefined;
    messageFormatter = undefined;
  }
  catch (error) {
    // Application has failed to clear user data. Reload the page.
    location.reload();
  }
}

//#endregion Login/Logout/Authentication functions

//#region Web page UI rendering functions

/**
 * Initialize the main screen which has two tabs "Chats" and "Contacts"
 */
function initMainScreen() {
  const bbmChat = document.querySelector('#conversationPane');
  bbmChat.setContactManager(contactsManager);
  bbmChat.setBbmSdk(bbmeSdk);
  bbmChat.setTimeRangeFormatter(new TimeRangeFormatter());
  messageFormatter = new MessageFormatter(contactsManager);
  bbmChat.setMessageFormatter(messageFormatter);
  const chatHeader = bbmChat.getChatHeader();
  chatHeader.addEventListener('makeCall', event => {
    handleMakeCall(event.detail.regId, event.detail.isVideo);
  });
  chatHeader.addEventListener('inviteOthers', inviteContactsClick);

  // Initialize the chat list for "Chats" tab
  initChatList();
  document.getElementById('headerText').innerHTML = userName;
  document.getElementById('headerImage').src =
    userAvatarURL || './images/defaultAvatar.png';
  // Now show the side panel icon
  $('.rightSidePaneBtnDiv').show();
  // Set the default place holder on the conversation pane and hide the
  // conversation pane.
  $('#contentPanePlaceHolder').show();
  $('#conversationPane').hide();
  document.getElementById('contentPanePlaceHolderImg').src
    = './images/no_chats_guy.png';
  document.getElementById('contentPanePlaceHolderText').innerHTML
    = 'No chat selected.';
  // Clear selectedChatId, we no longer have an active chat.
  selectedChatId = '';
}

/**
 * Handles user_added user_changed events from user manager. Updates user
 * information with new values.
 * @param {UserInfo} userInfo Contains information about the new user added.
 */
function onUserInfo(userInfo) {
  if (!userInfo.avatarUrl) {
    contactsManager.getUserAvatar(userInfo.regId);
  }
  const avatarUrl = userInfo.avatarUrl || './images/defaultAvatar.png';
  if (userRegId === userInfo.regId) {
    userName = userInfo.displayName;
    userAvatarURL = avatarUrl;
    document.getElementById('headerText').innerHTML = userName;
    document.getElementById('headerImage').src = userAvatarURL;
  }
  const contactData = new BBMData(DATA_BIND_PREFIX_CONTACT + userInfo.regId);
  contactData.set(DATA_CONTACT_NAME, userInfo.displayName);
  contactData.set(DATA_CONTACT_IMG_URL, avatarUrl);
}

/**
 * Displays contact list in the configured display mode.
 * @param {string} mode Display mode of the bbm-contact-list.
 * Use "StartChat" to select contacts to start chat with.
 * Use "InviteOthers" to select contacts to invite to the selected chat.
 * @param {function} onSelectedAction Action to be performed with the selected
 * contacts.
 */
function showContacts(mode, onSelectedAction) {
  const bbmContactList = document.querySelector('#bbmContactList');
  bbmContactList.displayMode = mode;
  const chatList = document.querySelector('#chatListContainer');

  const showChatPane = () => {
    bbmContactList.removeEventListener('Ok', onOkClicked);
    bbmContactList.removeEventListener('Cancel', onCancelClicked);
    bbmContactList.style.display = 'none';
    chatList.style.display = 'block';
  };

  const onOkClicked = e => {
    showChatPane();
    onSelectedAction(e.detail);
  };

  const onCancelClicked = () => {
    showChatPane();
  };

  bbmContactList.addEventListener('Ok', onOkClicked);
  bbmContactList.addEventListener('Cancel', onCancelClicked);

  chatList.style.display = 'none';
  bbmContactList.style.display = 'flex';
}

/**
 * Displays contact list in the 'InviteContacts' display mode.
 * Starts chat with selected contacts.
 */
function showContactsClick() {
  showContacts('StartChat', selectedInfo => {
    const chatDetails = {
      invitees: selectedInfo.selectedContacts,
      isOneToOne: !selectedInfo.isMultiChat,
      subject: selectedInfo.isMultiChat ? selectedInfo.chatName : ''
    };

    if (selectedInfo.isMultiChat) {
      chatDetails.invitePolicy = selectedInfo.isAllowInvites
        ? BBMEnterprise.Messenger.Chat.InvitePolicy.ParticipantsOnly
        : BBMEnterprise.Messenger.Chat.InvitePolicy.AdminsOnly;
    }

    messenger.chatStart(chatDetails)
    .then(pendingChat => {
      // Opening conversation for the pending chat.
      onChatSelected(pendingChat.chat.chatId, selectedInfo.selectedContacts);
    });
  });
}

/**
 * Displays contact list in the 'InviteContacts' display mode.
 * Invites selected contacts to the currently selected chat.
 */
function inviteContactsClick() {
  showContacts('InviteOthers', selectedInfo => {
    const selectedContactRegIds = selectedInfo.selectedContacts;
    messenger.chatInvite(selectedChatId, selectedContactRegIds);
  });
}

/**
 * Showing the settings pane
 */
function showSettingsPane() {
  // Only show the settings pane.
  $('#loginPane').hide();
  // Hide the main screen.
  $('#mainScreen').css('display', 'none');
  // Show the settings screen.
  $('#settingsPane').css('display', '');

  // If we have remembered the userId with which the user was signed in, allow
  // them to logout.
  if(localStorage.userID) {
    $('#logoutBtn').show();
  } else {
    $('#logoutBtn').hide();
  }

  document.getElementById('userName').innerHTML = `Display Name: ${userName}`;
  document.getElementById('email').innerHTML = `Email: ${userEmail}`;
  document.getElementById('domain').innerHTML = `Domain: ${ID_PROVIDER_DOMAIN}`;
  document.getElementById('localRegId').innerHTML = `Local RegId: ${userRegId}`;
  document.getElementById('localPIN').innerHTML = `Local PIN: ${userPin}`;
  document.getElementById('registrationState').innerHTML =
    `Registration State: ${regState}`;
}

/**
 * Closing the settings pane.
 */
function closeSettingsPane() {
  // Hide the settings screen.
  $('#settingsPane').css('display', 'none');
  // Are we currently registered with the infrastructure?
  if(regState === 'Success') {
    // Yes. Show the main screen so the user can continue their session.
    $('#mainScreen').css('display', '');
  } else {
    // No. Show the login pane so that the user may see the registration status
    // message(s).
    $('#loginPane').show();
  }
}

/**
 * Gets the contact name.
 * @param {string} regId The regId of the user.
 * @returns {string} Contact name.
 */
function getDisplayName(regId) {
  var contactName = contactsManager.getDisplayName(regId);
  if (contactName === null) {
    // Escape user name to prevent any JavaScript in it from executing.
    contactName = regId === userRegId
      ? escapeUserTextToDisplay(userName)
      : regId;
  }
  return contactName;
}


/**
  * Create a chat element for the list on chat tab.
  * @param {string} chatId The id of the BBMData which wraps "chat" object.
  * @param {number} unreadCount The number of unread messages in the chat.
  * @returns {string} The string of UI element.
  */
function createChatElement(chatId, unreadCount) {
  return '<div class="chatRowImageWrapper">'
    + getChatAvatarElement(chatsMap[chatId], 'chatAvatarImg')
    + '</div>'
    + '<div class="chatRowContentWrapper">'
    + getChatSubjectElement(chatsMap[chatId], 'chatSubject', undefined, unreadCount)
    + createChatMessageElement(chatsMap[chatId])
    + '</div>';
}

/**
  * Create an element Id of the row on the chat list.
  * @param {string} chatId The id of the "Chat" object.
  * @returns {string} The element Id of the chat list row.
  */
function createChatRowElementId(chatId) {
  return PREFIX_ID_CHAT_LIST_ROW + correctHTMLAttributeName(chatId);
}

/**
  * Add a chat element to the list on chat tab.
  * @param {object} chat The chat object that UI element needs to add.
  */
 function addChatElement(chat) {
  var chatId = chat.chatId;
  // Check if the chats map contains a chat that has the same chatId.
  if (chatsMap[chatId] === undefined) {
    // Create a BBMData (having id: 'Chat-chatId') to wrap "chat" object for
    // data binding. Add the chat into the map, so the chat can be found by its
    // chatId. This must happen first so that any updates that are triggered by
    // calling chatData.set() below will be able to find the relevant data.
    chatsMap[chatId] = new BBMData(DATA_BIND_PREFIX_CHAT + chatId);
    // Get the unread message count.
    chatsMap[chatId].set(DATA_CHAT, chat);
    // Insert the new chat to the top of list on the chat tab to display
    $('#chatListRowPlaceholder').after(
      '<div class="chatRow" onclick="onChatSelected(this.getAttribute('
      + "'chatId'" + '))" id="' + createChatRowElementId(chatId)
      + '" chatId="' + chatId + '"'
      + DATA_BIND_PREFIX + DATA_BIND_PREFIX_CHAT
      + correctHTMLAttributeName(chatId)
      + '="' + DATA_CHAT + '">'
      + createChatElement(chatId, '')
      + '</div>');
    messenger.getUnreadCount(chatId)
    .then(unreadCount => {
      if (unreadCount > 0) {
        const chatElement = $('#' + createChatRowElementId(chatId));
        const newElementContent =
          $.parseHTML(createChatElement(chatId, unreadCount));
        chatElement.removeChild(chatElement.childNodes[0]);
        chatElement.appendChild(newElementContent);
      }
    });
  } else {
    // Filter out a new chat that has the same chatId with the existing chat
    // in the map.
    //
    // This should not happen but still good to have this code to avoid the
    // duplicated chats in the current database.
    console.log(`SECI Chat: Chats map already has an entry with the same `
      + `chatId: ${chatId}. This Chat will be ignored.`);
  }
}

/**
  * Update a chat element to the list on chat tab.
  * @param {object} chat The chat object that UI element needs to update.
  */
function updateChatElement(chat) {
  var chatId = chat.chatId;
  var chatData = chatsMap[chatId];
  // Check if the chats map contains a chat that has the same chatId.
  if (chatData) {
    // Set the properties needed by UI elements.
    chatData.set(DATA_CHAT, chat);
  } else {
    // Prevent the map from updating a chat that was never added before.
    console.log(`SECI Chat: The chat: ${chatId} has never been added to map `
      + `before. Ignore this update.`);
  }
}

/**
  * Remove a chat element to the list on chat tab.
  * @param {object} chat The chat object that UI element needs to remove.
  */
function removeChatElement(chat) {
  var chatId = chat.chatId;
  // Check if the chats map contains a chat that has the same chatId.
  if(chatsMap[chatId]) {
    // Remove the chat from the map.
    delete chatsMap[chatId];
    $('#' + PREFIX_ID_CHAT_LIST_ROW + correctHTMLAttributeName(chat.chatId))
    .remove();

    // Are we removing the chat that is currently active?
    if (selectedChatId === chatId) {
      // Yes.  Just close the active chat abruptly. We could do something
      // fancier here like notify the user and disable the pane so the user has
      // a nicer experience, we don't to keep the example code interaction
      // simple. This also prevents the active pane from acting on the removed
      // chat which will raise errors in the console.
      console.log(`SECI Chat: The active chat with chatId: ${chatId} `
        + `was removed; closing the conversation pane`);

      // Set the default place holder on the conversation pane and hide the
      // conversation pane.
      $('#contentPanePlaceHolder').show();
      $('#conversationPane').hide();
      document.getElementById('contentPanePlaceHolderImg').src
        = './images/no_chats_guy.png';
      document.getElementById('contentPanePlaceHolderText').innerHTML
        = 'No chat selected.';
      // Clear selectedChatId, we no longer have an active chat.
      selectedChatId = '';
    }
  }
  else {
    // Prevent the map from removing a chat that was never added before.
    console.log(`SECI Chat: The chat: ${chatId} has never been added to map `
    + ` before. Ignore this removal.`);
  }
}

/**
  * Create a message element for the chat.
  * @param {object} chatData The BBMData that wraps "Chat" object.
  * @returns {string} The string of UI element.
  */
function createChatMessageElement(chatData) {
  var isDefunct = chatData.get(DATA_CHAT).state ===
    BBMEnterprise.Messenger.Chat.State.Defunct;
  return isDefunct ? '<div class="chatMessage">Defunct Chat</div>' : '';
}

/**
 * Callback function for the selected chat.
 * @param {string} chatId The id of the selected chat object from the list on
 * the chat tab.
 * @param {string[]} invitees Array of regIds of users being invited to join the
 * chat.
 */
function onChatSelected(chatId, invitees) {
  var chatRowId = createChatRowElementId(chatId);

  // The same chat as the existing one is selected in some circumstances, make
  // this a no-op.
  if (selectedChatId === chatId) return;

  if (selectedChatId) {
    // Clean the existing highlighted row.
    $('#' + createChatRowElementId(selectedChatId)).toggleClass('selected');
  }

  //highlight the selected row from the list on the chat tab.
  $('#' + chatRowId).toggleClass('selected');
  selectedChatId = chatId;

  var bbmChat = document.querySelector('#conversationPane');
  bbmChat.setChatId(chatId);

  // Open a conversation pane.
  initConversationPane(selectedChatId, invitees);
}

/**
 * Get the UI element to display chat avatar.
 * @param {object} chatData The BBMData that wraps "Chat" object
 * @param {string} className The class name used by CSS.
 * @param {string} defaultAvatarURL The url of the default avatar.
 * @returns {string} The string of HTML element to display chat avatar.
 */
function getChatAvatarElement(chatData, className, defaultAvatarURL) {
  var avatarURL;
  var chat = chatData.get(DATA_CHAT);
  const getUserAvatar = regId => {
    return contactsManager.getUserAvatar(regId) || './images/defaultAvatar.png';
  };

  if (chat.isOneToOne) {
    // Get the participant's avatar.
    var participants = chat.participants;

    if (Array.isArray(participants)) {
      // Find the other participant's regId.
      var participant = chat.participants.find(participant =>
        participant.regId !== userRegId);

      if (participant !== undefined) {
        avatarURL = getUserAvatar(participant.regId) + '"' + ' '
          + DATA_BIND_PREFIX + DATA_BIND_PREFIX_CONTACT
          + correctHTMLAttributeName(participant.regId)
          + '="' + DATA_CONTACT_IMG_URL + '"';
      } else {
        avatarURL = (defaultAvatarURL === undefined ?
          './images/defaultAvatar.png' : defaultAvatarURL);
      }
    }
  } else {
    // Return MPC avatar.
    avatarURL = './images/ic_mpc_participants.png';
  }

  return `<img class="${className}" src="${avatarURL}">`;
}

/**
 * Get the UI element to display chat subject.
 * @param {object} chatData The BBMData that wraps "Chat" object.
 * @param {string} className The class name used by CSS.
 * @param {string} defaultSubject The default subject to display.
 * @returns {string} The string of HTML element to display chat subject.
 */
function getChatSubjectElement(chatData, className, defaultSubject, unreadCount) {
  var subject;
  var chat = chatData.get(DATA_CHAT);

  var unreadIndicator = (unreadCount ? ' chatRowNewMessages' : '');
  var unreadCountText = (unreadCount ? (' (' + unreadCount + ')'): '');

  if (chat.isOneToOne) {
    // Get the participant's avatar.
    var participants = chat.participants;
    if (Array.isArray(participants) && participants.length > 1) {
      var regId = chat.participants.find(participant =>
        participant.regId !== userRegId).regId;

      subject = '<div class="' + className + unreadIndicator
        +'"><div style="display: inline-block" class="' + className
        + unreadIndicator + '" '
        + DATA_BIND_PREFIX + DATA_BIND_PREFIX_CONTACT
        + correctHTMLAttributeName(regId)
        + '="' + DATA_CONTACT_NAME + '">' + getDisplayName(regId) + '</div>'
        + '<div class="' + unreadIndicator + '">' + unreadCountText
        + '</div></div>';
    } else {
      // 1:1 chat but the other participant has not yet joined.
      subject = '<div class="' + className + '">'
      + (defaultSubject === undefined
        ? 'Empty Chat' :  defaultSubject) + '</div>';
    }
  } else {
    if(chat.subject.length === 0
      && Array.isArray(chat.participants) && chat.participants.length > 1) {
      // Display some of the participants since the subject is empty.
      // Use div for the outer tag that contains all the names which are inside
      // span tags.  This way the outer div can control displaying the
      // ellipsis when the total length of all the names are too long and the
      // inner span tags control updating individual contact names if needed.
      subject = '<div class="' + className + unreadIndicator + '">';
      //unlikely more than 10 names would fit, so don't continue past that
      var stop = Math.min(chat.participants.length, 10);
      var addComma = false;
      for (var i = 0;i < stop; ++i) {
        var participant = chat.participants[i];
        if (participant.regId && participant.regId !== userRegId) {
          if (addComma) {
            subject += ', ';
          }
          // Use span for tag surrounding each name for data binding since
          // using div would conflict with a parent/outer div for class, and we
          // can't use the div for each class since the ellipsis wouldn't work
          // for group.
          subject += '<span '
            + DATA_BIND_PREFIX + DATA_BIND_PREFIX_CONTACT
            + correctHTMLAttributeName(participant.regId)
            + '="' + DATA_CONTACT_NAME + '">'
            + getDisplayName(participant.regId)
            + '</span>';
          addComma = true;
        }
      }
      subject += unreadCountText + '</div>';
    } else {
      //For MPC, just use its subject
      subject = '<div class="' + className + unreadIndicator + '">'
        + (chat.subject.length > 0
            ? escapeUserTextToDisplay(chat.subject)
              : (defaultSubject === undefined ? 'No subject' :  defaultSubject))
        + unreadCountText
        + '</div>';
    }
  }
  return subject;
}

/**
 * Initialize a conversation pane for a chat.
 */
function initConversationPane() {
  // Hide the conversation placeholder and show the conversation pane.
  $('#contentPanePlaceHolder').hide();
  $('#conversationPane').show();
}

/**
 * Show a notification to indicate the arrival of a new message. Request
 * permission if necessary.
 * @param {ChatMessageAddedEvent} message The event indicating that a message
 * has arrived.
 */
function showNotification(message) {
  var Notification = window.Notification;

  // Actually display the notification. This is done only after checking that we
  //  have permission.
  function displayNotification() {
    var notification = new Notification('SECI Chat', {
      body: messageFormatter.getMessageText(message.message),
      icon: 'images/favicon.ico',
      timestamp: true,
      data: message.chat.chatId
    });
    setTimeout(notification.close.bind(notification), 5000);
    notification.addEventListener('click', event => {
      if (window) {
        window.focus();
      }
      notification.close();
      onChatSelected(event.target.data);
    });
  }

  // Check for permission.
  if(Notification && Notification.permission !== 'notsupported') {
    if(Notification.permission === 'granted') {
      // Permission was granted, display the notification.
      displayNotification();
    } else if( Notification.permission !== 'denied' ||
               Notification.permission === 'default') {
      // We do not have permission, request it.
      Notification.requestPermission().then(displayNotification);
    }
  }
}

/**
 * Correct a HTML attribute name by removing any invalid character from it.
 * This name is used for adding an attribute on UI elements for data Binding.
 * @param {string} str The string to validate.
 * @returns {string} the string without any invalid character.
 */
function correctHTMLAttributeName(name) {
  // '.' or ',' is invalid for the name of the attribute in HTML elements
  // Replace '.' or ',' with '_'.
  return $.type(name) === 'string'
    ? name.replace(/\.|,/g,"_")
    : name;
}

/**
 * Escape the &lt; and &gt; symbols in user generated text so it can be safely
 * added to the web page. This should be called before displaying any user
 * generated text from chat messages, subjects, user names, status, or otherwise
 * to display the text as is and ensure that any embedded JavaScript is not
 * executed.
 * @param {string} text Some user generated text.
 * @returns {string} The text with HTML modified to be safe to display in HTML.
 */
function escapeUserTextToDisplay(text) {
  return text
    ? text
      // Use regex with the g (global) flag to replace all instead of just
      // first.
      .replace(/</g,'&lt;')
      // Just replacing the opening < will prevent the text from getting
      // interpreted as HTML or JavaScript but also replace the > closing for
      // completeness.
      .replace(/>/g,'&gt;')
    : text;
}

/**
 * A data wrapper which wraps BBM data to be binded to UI elements.
 * @param {string} id The identity of the data model.
 * @returns {object} The object that wraps BBM data.
 */
function BBMData(id) {
  var verifiedId = correctHTMLAttributeName(id);
  var binder = new BBMDataBinder(verifiedId);
  var data = {
    // An array to store BBM data attributes.
    attributes: {},
    // The attribute setter publish changes using DataBinder.
    set: function(attrName, val) {
      this.attributes[attrName] = val;
      binder.trigger(verifiedId + ':change', [attrName, val, this]);
    },
    // The attribute getter.
    get: function(attrName) {
      return this.attributes[attrName];
    }
  };
  return data;
}

/**
 * A data binder follows publish/subscribe pattern to bind changes to a data
 * object’s properties to changes in the UI elements.
 * @param {string} objectId The identity of the data object.
 * @returns {object} The jQuery object to trigger the data change.
 */
function BBMDataBinder(objectId) {
  // Use a jQuery object as simple publish/subscribe pattern.
  var pubSub = jQuery({});
  // Expect a data element specifying the binding in the form:
  // data-bind-<objectId>="<propertyName>"
  var dataAttr = DATA_BIND_PREFIX + objectId;
  var message = objectId + ':change';
  // PubSub listens to the changes and propagates them to all bound elements,
  // and sets the value.
  pubSub.on(message, function(evt, attrName, newVal) {
    // Find all UI elements that has data attribute: [data-bind-XXX]=YYY to
    // update by data. For example:
    // <div data-bind-contact-787093443485630519=contactName>Michael</div>;
    jQuery( "[" + dataAttr + "='" + attrName + "']" ).each(function() {
      var $boundElement = jQuery(this);
      // Update UI elements.
      if (attrName === DATA_CONTACT_IMG_URL) {
        // Update the contact avatar image.
        if($boundElement.is('img')){
          $boundElement.attr('src', newVal);
        }
      } else if(attrName === DATA_CONTACT_NAME) {
        // Update the contact contact name.
        if($boundElement.is('input, textarea, select')) {
          $boundElement.val(newVal);
        } else {
          $boundElement.html(newVal);
        }
      } else if (attrName === DATA_CHAT) {
        // Update the chat related UI elements.
        var elementId = $boundElement.attr('id');
        if(elementId && elementId.startsWith(PREFIX_ID_CHAT_LIST_ROW)) {
          // Update the row of the chat list.
          messenger.getUnreadCount(newVal.chatId)
          .then(unreadCount => {
            $boundElement.html(createChatElement(newVal.chatId, unreadCount));
          });
        }
      }
    });
  });
  return pubSub;
}

//#region Voice/Video calls

function handleMakeCall(regId, isVideo) {
  if (bbmCallWidget) {
    alert('Another call is in progress.');
    return;
  }
  bbmCallWidget = document.createElement('bbm-call');
  bbmCallWidget.setContactManager(contactsManager);
  bbmCallWidget.setBbmSdk(bbmeSdk);
  document.body.appendChild(bbmCallWidget);
  setWidgetDraggable(bbmCallWidget);
  bbmCallWidget.makeCall(regId, isVideo);
  bbmCallWidget.addEventListener('CallEnded', () => {
    document.body.removeChild(bbmCallWidget);
    bbmCallWidget = null;
  });
}

/**
 * Handles the incoming call event and creates the notification.
 * @param mediaCall The media call received on event
 * {@link BBMEnterprise.Media#incomingCall}
 */
function handleIncomingCall(mediaCall) {
  if (bbmCallWidget) {
    // User is in another call;
    mediaCall.reject(BBMEnterprise.Media.CallEndReason.REJECT_CALL);
    return;
  }
  bbmCallWidget = document.createElement('bbm-call');
  bbmCallWidget.setContactManager(contactsManager);
  bbmCallWidget.setBbmSdk(bbmeSdk);
  bbmCallWidget.addEventListener('CallEnded', () => {
    document.body.removeChild(bbmCallWidget);
    bbmCallWidget = null;
  });
  bbmCallWidget.receiveCall(mediaCall);
  document.body.appendChild(bbmCallWidget);
  setWidgetDraggable(bbmCallWidget);
}

//#endregion Voice/Video calls

//#region File transfer drag drop

/**
 * Make the drag event compatible across browsers by ensuring the files array is
 * populated.
 * @param {DragEvent} event The event from the ondragover or ondrop handler.
 */
function compatibleDragEvent(event) {
  var dt = event.dataTransfer;
  if (!dt) {
    return;
  }
  if (!dt.files && dt.items) {
    dt.files = [];
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < dt.items.length; i++) {
      if (dt.items[i].kind == 'file') {
        dt.files.push(dt.items[i].getAsFile());
      }
    }
  }
}

/* A debounce timer to cancel out the dragleave and dragover event */
var dragOverlayHideTimer;

/**
 * Drag/drop handler for file transfer dragging over the element.
 * @param {DragEvent} event The event from the ondragover handler.
 */
function onFileSendDragoverHandler(event) {
  var overlay = $('.fileSendDragDropOverlay');
  if (!overlay.is(':visible')) {
    compatibleDragEvent(event);
    var dt = event.dataTransfer;
    var length = dt.files.length || dt.items.length;

    // Check if all selected items are files.
    if (dt.items
        && dt.items.some((item) => { item.kind !== 'file'; })) {
      $('.fileSendDragDropOverlayText').text('Please select only files.');
    } else if (length > MAX_FILES_SEND) {
      $('.fileSendDragDropOverlayText')
      .text(`Too may files selected (max is ${MAX_FILES_SEND}).`);
    } else {
      $('.fileSendDragDropOverlayText')
      .text('Drop to send files to the participants');
    }
    $('.fileSendDragDropOverlay').show();
  }
  if (dragOverlayHideTimer) {
    clearTimeout(dragOverlayHideTimer);
    dragOverlayHideTimer = null;
  }
  event.preventDefault();
}

/**
 * Drag/drop handler for file transfer dragging ended.
 * @param {DragEvent} event The event from the ondragleave handler.
 */
function onFileSendDragendHandler(event) {
  // Give a little debounce time for the overlay to be removed, to avoid
  // flickers when dragging around in the dropping area.
  if (!dragOverlayHideTimer) {
    dragOverlayHideTimer = setTimeout(() => {
      $('.fileSendDragDropOverlay').hide();
      dragOverlayHideTimer = null;
    }, 500);
  }
  event.preventDefault();
}

/**
 * Drag/drop handler for dropping on the element.
 * @param {DragEvent} event The event from the ondrop handler.
 */
function onFileSendDropHandler(event) {
  $('.fileSendDragDropOverlay').hide();
  event.preventDefault();
  compatibleDragEvent(event);
  var dt = event.dataTransfer;
  if (dt.files.length > MAX_FILES_SEND) {
    console.warn(`File transfer aborted as too many files`
      + ` selected: ${dt.files.length}`);
    return;
  }

  var bbmChatInput = $('#bbmChatInput')[0];
  for (var i = 0; i < dt.files.length; i++) {
    bbmChatInput.sendMessage('', dt.files[i]);
  }
}

//#endregion File transfer drag drop

//#region Utils

/**
 * Makes DOM element on the screen draggable by holding left mouse click.
 * @param {object} uiWidget The UI widget to be moved.
 */
function setWidgetDraggable(uiWidget) {
  var isDragging = false;
  var dragOffsetX = 0;
  var dragOffsetY = 0;

  const onMouseDownHandler = e => {
    if (e.button === 0) {
      isDragging = true;
      dragOffsetX = e.screenX - uiWidget.offsetLeft;
      dragOffsetY = e.screenY - uiWidget.offsetTop;
    }
  };

  const onMouseUpHandler = e => {
    if (e.button === 0) {
      isDragging = false;
      dragOffsetX = 0;
      dragOffsetY = 0;
    }
  };

  const onMouseMoveHandler = e => {
    if (isDragging) {
      uiWidget.style.left = `${e.screenX - dragOffsetX}px`;
      uiWidget.style.top = `${e.screenY - dragOffsetY}px`;
    }
  };

  const onDomNodeRemoved = e => {
    if (e.target === uiWidget) {
      document.body.removeEventListener('DOMNodeRemoved', onDomNodeRemoved);
      document.body.removeEventListener('mousemove', onMouseMoveHandler);
      document.body.removeEventListener('mouseup', onMouseUpHandler);
      uiWidget.removeEventListener('mousedown', onMouseDownHandler);
      uiWidget = null;
    }
  };

  uiWidget.addEventListener('mousedown', onMouseDownHandler);
  document.body.addEventListener('mouseup', onMouseUpHandler);
  document.body.addEventListener('mousemove', onMouseMoveHandler);
  document.body.addEventListener('DOMNodeRemoved', onDomNodeRemoved);
}

//#endregion Utils

//#endregion Web page UI rendering functions
//****************************************************************************

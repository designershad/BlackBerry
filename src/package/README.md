{@replace BRAND_FULL} provides a framework to develop real-time, end-to-end
secure messaging capabilities in your own product or service.

The {@replace BRAND_SHORT} security model ensures that only the sender and
intended recipients can see each message sent, and ensures that messages
aren't modified in transit between the sender and recipient.
{@replace BRAND_SHORT} also provides the framework for other forms of
collaboration and communication, such as push notifications, secure voice and
video calls, and file sharing.  You can even extend and create new types of
real-time services and use cases by defining your own custom application
protocols and data types.

Example applications are expected to be replaced or customized by the customer
to suit their own integration with the {@replace BRAND_SHORT} SDK for
JavaScript.

The core components:

![components](components.png)

* **[BBMEnterprise](BBMEnterprise.html)**<br/>
  This class is responsible for establishing and maintaining connectivity to
  the {@replace BRAND_SHORT} infrastructure.  It provides access to the
  messaging, media, and endpoint management interfaces.

* **[BBMEnterprise.Messenger](BBMEnterprise.Messenger.html)**<br/>
  This class offers the {@replace BRAND_SHORT} messaging interfaces.  It
  provides methods for creating, inviting, joining, and leaving chats as well
  as methods for interacting with those chats.

* **[BBMEnterprise.Media](BBMEnterprise.Media.html)**<br/>
  This library offers the {@replace BRAND_SHORT} media interfaces.  It
  provides methods and events for making, accepting and interacting with
  voice/video calls and data only connections.

* **[BBMEnterprise.Event](BBMEnterprise.Event.html)**<br/>
  This library defines structure of the events emitted by the BBMEnterprise
  and BBMEnterprise.Messenger objects.

* **[BBMEnterprise.Error](BBMEnterprise.Error.html)**<br/>
  This library defines the different error classes that may by returned by the
  BBMEnterprise and BBMEnterprise.Messenger interfaces.

* **Examples**<br/>
  This collection of JavaScript, HTML, and resources provides example
  applications that exercise the functionality offered by the
  {@replace BRAND_SHORT} SDK for JavaScript.

{@replace BRAND_SHORT} SDK utilities:
* **[BBMEnterprise.Util](BBMEnterprise.Util.html)**<br/>
  This library exposes some utility functions that are useful when dealing
  with binary data.

* **[BBMEnterprise.Utf8](BBMEnterprise.Utf8.html)**<br/>
  This library provides some utility functions that are useful when dealing
  with UTF-8 data.

Components for customizing the {@replace BRAND_SHORT} SDK message storage:
* **[BBMEnterprise.MessageStorageInterface](BBMEnterprise.MessageStorageInterface.html)**<br/>
  The virtual interface that must be overridden by any application that needs
  to implement a custom data storage for chat messages.

* **[BBMEnterprise.Storage](BBMEnterprise.Storage.html)**<br/>
  This library provides some convenient implementations of the
  MessageStorageInterface.

Components for customizing the {@replace BRAND_SHORT} SDK's Cloud Key Storage:
* **[BBMEnterprise.KeyProviderInterface](BBMEnterprise.KeyProviderInterface.html)**</br>
  The virtual interface that must be overridden by any application that will
  be using Cloud Key Storage.  Applications using the BlackBerry Key
  Management Service (KMS) do not make use of the KeyProviderInterface.

* **Support FirebaseKeyProvider**<br/>
  A reference implementation of the KeyProviderInterface using Google's
  Firebase Realtime Database.

* **Support CosmosDbKeyProvider**<br/>
  A reference implementation of the KeyProviderInterface using Microsoft Azure
  Cosmos DB.  This implementation uses the KeyProviderServer to enforce key
  access permissions to meet the [Cloud Key Storage](https://developer.blackberry.com/files/bbm-enterprise/documents/guide/html/cloudKeyStorage.html)
  requirements.

Components for customizing your application's identity and user management:

* **Support FirebaseUserManager**<br/>
  A reference implementation of user contact list management module based on
  Google's Firebase Realtime Database.

* **Support AzureUserManager**<br/>
  A reference implementation using Microsoft's Graph APIs to access basic user
  information from your application's Active Directory instance.

* **Support GoogleAuthManager**<br/>
  A reference implementation using Google's OAuth 2.0 APIs to authenticate
  users of your application.

* **Support AzureAuthManager**<br/>
  A reference implementation using Microsoft's Azure Active Directory v2.0
  OpenID Connect APIs to authenticate user of your application against your
  application's Active Directory instance.

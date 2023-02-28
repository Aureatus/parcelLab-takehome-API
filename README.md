
# Parcellab Takehome API

This is an API for parcellabs backend takehome, which takes in a payload, manipulates it to fit the parcelLab tracking data model if it can, and fake sends it to the https://api.parcellab.com/track/ endpoint.







## API Reference

```http
POST /tracking
```
### Body

| Name | Type | Description |
| :--- | :--- | :--- |
| `courier` | `Carrier Code` | **Required**. A parcellab compatible carrier code
| `tracking_number` | `string` | **Required**. Unique tracking number. |
| `zip_code` | `string` | **Required**. Postal code. |
| `destination_country_iso3` | `ISO 3166-1 alpha-3 or alpha-2` | **Required**. Destination country (for example:DEU or DE). |
| `return` | `Boolean` | **Optional**. If true, the delivery is handled as a return (that is: by default no communication is sent to the set recipient). Dispatch delays will not be monitored and the tracking will not be considered for general reporting.
| `cancelled` | `Boolean` | **Optional**. If true, delivery is cancelled (that is: no communication is sent to the set recipient). All monitoring and reporting is disabled.
| `notificationsInactive` | `Boolean` | **Optional**. If true, communication to the customer is stopped immediately.

---

```http
POST /tracking/file/:type
```

### Parameters

#### Path

| Name | Type | Description |
| :--- | :--- | :--- |
| `type` | `string` | **Required**. Any free text string [a-zA-Z0-9] describing the file type, could be the origin system name. Each different data file format needs to have their own type.

#### Body

| Name | Type | Description |
| :--- | :--- | :--- |
| `data` | `object` | **Required**. Multipart upload file(Supported file types are JSON and CSV.) Sample files can be found [here](https://how.parcellab.works/docs/data-integration/creating-a-new-tracking/file-based#ftp-upload)


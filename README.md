# bento-icdc-interoperation

This microservice supports data interoperability between the ICDC and Cancer Genomics Cloud. It receives file manifest data in the form of a JSON string from the ICDC front end, converts it to CSV format, stores it in an S3 bucket and returns a signed URL for access.

&nbsp;

## Interoperation process overview

![Interoperation Sequence Diagram](./doc/sequence_diagram.png)

&nbsp;

## Usage

### Example query:

```
{
    storeManifest(manifest: "[{\"file_name\":\"010015_0103_sorted.bam\",\"file_type\":\"RNA Sequence File\",\"sample_id\":\"NCATS-COP01-CCB010015 0103\",\"association\":\"sample\",\"file_description\":\"tumor sample binary alignment file: seq reads to canfam3.1\",\"file_format\":\"bam\",\"file_size\":17545870661,\"case_id\":\"NCATS-COP01-CCB010015\",\"breed\":\"Mixed Breed\",\"diagnosis\":\"B Cell Lymphoma\",\"study_code\":\"NCATS-COP01\",\"file_uuid\":\"bf7ae08f-0afe-5aa5-969a-de9a17ac0f2f\",\"md5sum\":\"70ec6bee3d4e5bb9da4641c3fa7f8609\",\"individual_id\":null,\"drs_uri\":\"https://nci-crdc.datacommons.io/ga4gh/drs/v1/objects/dg.4DFC/bf7ae08f-0afe-5aa5-969a-de9a17ac0f2f\",\"name\":\"010015_0103_sorted.bam\"}]")
}
```

&nbsp;

### Example response:

```
{
    "data": {
        "storeManifest": "https://d1mctv657ruqk3.cloudfront.net/d228872c-4f12-4c52-a9dc-ef3ab953ae75.csv?Expires=0&Key-Pair-Id=K2X5RJOOJWYIEB&Signature=CBB2T1qHhKaWjnVvlFsxfeqnGVcQEJOxIesXpRFYkK3C6Ne3JZU2qHhRH97BFLbpWh570A50JtkZH0~zsJ3N5ZjYLccvSKtFM3oxmxByvSHQtBPtFrhokL6gD1aA0ueoW1XtnZ9MJIYoVZNqVrHpHf2zN59evQD3UPrCkf7dc~6BGmroGI8WVGm6N1TiVpw4alNxsqHttRxLNr0bttPiE7Fc2Oi5K3bOqyJAYVtq2HoOnSahLBkXLf9IK46pLGG88hmipulhbvTi2V5xa7usNYlQ-vwmW1j667dU~ac~Ue8HsnlHcTTU~tTD8Zz7zIIjKhPpm45C8HVdm-LTnauK7A__"
    }
}
```

&nbsp;

## Environment variables

AWS_REGION

S3_ACCESS_KEY_ID

S3_SECRET_ACCESS_KEY

FILE_MANIFEST_BUCKET_NAME

CLOUDFRONT_KEY_PAIR_ID

CLOUDFRONT_PRIVATE_KEY

CLOUDFRONT_DOMAIN

SIGNED_URL_EXPIRY_SECONDS

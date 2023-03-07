# bento-icdc-interoperation

This microservice supports interoperability between the ICDC and other nodes in the CRDC via publicly-available APIs. It identifies ICDC-relevant data in the CRDC nodes, maps the data to corresponding ICDC studies and provides an API for the ICDC front-end to retrieve information about the available data, including how to access it. Currently, the microservice searches for and returns relevant image collection data from the IDC and TCIA CRDC nodes; however, with minor updates, the number of CRDC nodes examined can easily be expanded as the need arises.

&nbsp;

## Interoperation process overview

![Interoperation Sequence Diagram](./public/images/sequence_diagram.png)

&nbsp;

## Data available from CRDC nodes

| CRDC Node |                                                  Response data fields                                                   |
| :-------: | :---------------------------------------------------------------------------------------------------------------------: |
|    IDC    | Collection, cancer_type, date_updated, description, doi, image_types, location, species, subject_count, supporting_data |
|   TCIA    |              Collection, total_patientIDs, unique_modalities, unique_bodypartsExamined, total_imageCounts               |

&nbsp;

## Usage

### Example query:

```
{
    studiesByProgram {
        clinical_study_designation,
        CRDCLinks {
            url,
            repository,
            metadata {
                Collection,
                ... on IdcMetadata {
                    cancer_type,
                    date_updated,
                    description,
                    doi,
                    image_types,
                    location,
                    species,
                    subject_count,
                    supporting_data
                }
                ... on TciaMetadata {
                    total_patientIDs,
                    unique_modalities,
                    unique_bodypartsExamined,
                    total_imageCounts
                }
            }
        },
        numberOfCRDCNodes,
        numberOfImageCollections
    }
}
```

&nbsp;

### Example response:

```
{
    "data": {
        "studiesByProgram": [
            {
                "clinical_study_designation": "GLIOMA01",
                "CRDCLinks": [
                    {
                        "url": "https://portal.imaging.datacommons.cancer.gov/explore/filters/?collection_id=icdc_glioma",
                        "repository": "IDC",
                        "metadata": {
                            "Collection": "icdc_glioma",
                            "cancer_type": "Glioma",
                            "date_updated": "2022-10-10",
                            "description": "<p><b><a href=\"https://doi.org/10.7937/TCIA.SVQT-Q016\" target=\"_blank\">ICDC-Glioma</a>&#160;</b>contains treatment-na&#239;ve naturally-occurring <b>canine glioma</b> participants from the&#160;<a href=\"https://caninecommons.cancer.gov/#/study/GLIOMA01\">Integrated Canine Data Commons</a>. Brain radiology (57/81 participant animals) and H&amp;E-stained biopsy or necropsy pathology (76/81 participants) are classified by veterinary and physician neuropathologists.<br>&#10;&#9;<br>&#10;&#9;Please see the wiki <a href=\"https://doi.org/10.7937/TCIA.SVQT-Q016\" target=\"_blank\"><b>ICDC-Glioma</b></a>&#160;to learn more about the images and to obtain any supporting metadata for this collection.</p>&#10;",
                            "doi": "10.7937/tcia.svqt-q016",
                            "image_types": "MR",
                            "location": "Head",
                            "species": "Canine",
                            "subject_count": 57,
                            "supporting_data": "Genomics"
                        }
                    },
                    {
                        "url": "https://nbia.cancerimagingarchive.net/nbia-search/?MinNumberOfStudiesCriteria=1&CollectionCriteria=ICDC-Glioma",
                        "repository": "TCIA",
                        "metadata": {
                            "Collection": "ICDC-Glioma",
                            "total_patientIDs": 57,
                            "unique_modalities": [
                                "MR"
                            ],
                            "unique_bodypartsExamined": [
                                "HEAD"
                            ],
                            "total_imageCounts": 17797
                        }
                    }
                ],
                "numberOfCRDCNodes": 2,
                "numberOfImageCollections": 2
            }
        ]
    }
}
```

&nbsp;

## Environment variables

    - BENTO_BACKEND_GRAPHQL_URI: Bento backend URI for GraphQL POST requests

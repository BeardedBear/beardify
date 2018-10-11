module Search.Encoders exposing (encodeAlbum, encodeTrack)

import Json.Encode as Encode


encodeAlbum : String -> Encode.Value
encodeAlbum uri =
    Encode.object
        [ ( "context_uri", Encode.string uri )
        ]


encodeTrack : List String -> Encode.Value
encodeTrack uris =
    Encode.object
        [ ( "uris", Encode.list Encode.string uris )
        ]

module Data.Track exposing
    ( Track
    , TrackId
    , TrackSimplified
    , TrackSimplifiedPaging
    , decodeTrack
    , decodeTrackSimplified
    , decodeTrackSimplifiedPaging
    , encodeDelCollectionAlbum
    , encodeDelCollectionAlbumInner
    , encodeTrack
    , trackInit
    )

import Data.Album exposing (Album, albumInit, decodeAlbum)
import Data.Artist exposing (ArtistSimplified, decodeArtistSimplified)
import Json.Decode as Decode exposing (Decoder(..), at, field, null, string)
import Json.Encode as Encode


type alias TrackId =
    String


trackInit : Track
trackInit =
    { name = ""
    , duration_ms = 0
    , artists = []
    , album = albumInit
    , uri = ""
    }


encodeDelCollectionAlbumInner : String -> Encode.Value
encodeDelCollectionAlbumInner uri =
    Encode.object
        [ ( "uri", Encode.string uri )
        ]


encodeDelCollectionAlbum : List String -> Encode.Value
encodeDelCollectionAlbum uri =
    Encode.object
        [ ( "tracks", Encode.list encodeDelCollectionAlbumInner uri )
        ]


encodeTrack : List String -> Encode.Value
encodeTrack uris =
    Encode.object
        [ ( "uris", Encode.list Encode.string uris )
        ]


type alias Track =
    { name : String
    , duration_ms : Int
    , artists : List ArtistSimplified
    , album : Album
    , uri : String
    }


decodeTrack : Decode.Decoder Track
decodeTrack =
    Decode.map5 Track
        (Decode.field "name" Decode.string)
        (Decode.field "duration_ms" Decode.int)
        (Decode.at [ "artists" ] (Decode.list decodeArtistSimplified))
        (Decode.at [ "album" ] decodeAlbum)
        (Decode.field "uri" Decode.string)


type alias TrackSimplified =
    { name : String
    , duration_ms : Int
    , artists : List ArtistSimplified
    , track_number : Int
    , uri : String
    }


decodeTrackSimplified : Decode.Decoder TrackSimplified
decodeTrackSimplified =
    Decode.map5 TrackSimplified
        (Decode.field "name" Decode.string)
        (Decode.field "duration_ms" Decode.int)
        (Decode.at [ "artists" ] (Decode.list decodeArtistSimplified))
        (Decode.field "track_number" Decode.int)
        (Decode.field "uri" Decode.string)


type alias TrackSimplifiedPaging =
    { items : List TrackSimplified
    , next : String
    }


decodeTrackSimplifiedPaging : Decode.Decoder TrackSimplifiedPaging
decodeTrackSimplifiedPaging =
    Decode.map2 TrackSimplifiedPaging
        (Decode.at [ "items" ] (Decode.list decodeTrackSimplified))
        (Decode.field "next"
            (Decode.oneOf [ string, null "" ])
        )

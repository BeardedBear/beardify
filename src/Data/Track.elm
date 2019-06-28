module Data.Track exposing
    ( Track
    , TrackSimplified
    , TrackSimplifiedPaging
    , decodeTrack
    , decodeTrackSimplified
    , decodeTrackSimplifiedPaging
    , encodeDelCollectionAlbum
    , encodeDelCollectionAlbumInner
    , encodeTrack
    , init
    )

import Data.Album
import Data.Artist
import Json.Decode as Decode exposing (Decoder(..), at, field, null, string)
import Json.Encode as Encode


init : Track
init =
    { name = ""
    , duration_ms = 0
    , artists = []
    , album = Data.Album.init
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
    , artists : List Data.Artist.ArtistSimplified
    , album : Data.Album.Album
    , uri : String
    }


decodeTrack : Decode.Decoder Track
decodeTrack =
    Decode.map5 Track
        (Decode.field "name" Decode.string)
        (Decode.field "duration_ms" Decode.int)
        (Decode.at [ "artists" ] (Decode.list Data.Artist.decodeArtistSimplified))
        (Decode.at [ "album" ] Data.Album.decodeAlbum)
        (Decode.field "uri" Decode.string)


type alias TrackSimplified =
    { name : String
    , duration_ms : Int
    , artists : List Data.Artist.ArtistSimplified
    , track_number : Int
    , uri : String
    }


decodeTrackSimplified : Decode.Decoder TrackSimplified
decodeTrackSimplified =
    Decode.map5 TrackSimplified
        (Decode.field "name" Decode.string)
        (Decode.field "duration_ms" Decode.int)
        (Decode.at [ "artists" ] (Decode.list Data.Artist.decodeArtistSimplified))
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

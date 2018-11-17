module Data.Playlist exposing
    ( Playlist
    , PlaylistPaging
    , PlaylistSimplified
    , PlaylistTrack
    , decodePlaylist
    , decodePlaylistPaging
    , decodePlaylistSimplified
    , decodePlaylistTrack
    , init
    )

import Data.Image exposing (..)
import Data.Track exposing (..)
import Http exposing (..)
import Json.Decode as Decode exposing (..)


init : Playlist
init =
    { id = ""
    , images = []
    , name = ""
    , uri = ""
    }


type alias Playlist =
    { id : String
    , images : List Image
    , name : String
    , uri : String
    }


decodePlaylist : Decode.Decoder Playlist
decodePlaylist =
    Decode.map4 Playlist
        (Decode.field "id" Decode.string)
        (Decode.at [ "images" ] (Decode.list decodeImage))
        (Decode.field "name" Decode.string)
        (Decode.field "uri" Decode.string)


type alias PlaylistSimplified =
    { id : String
    , images : List Image
    , name : String
    , uri : String
    }


decodePlaylistSimplified : Decode.Decoder PlaylistSimplified
decodePlaylistSimplified =
    Decode.map4 PlaylistSimplified
        (Decode.field "id" Decode.string)
        (Decode.at [ "images" ] (Decode.list decodeImage))
        (Decode.field "name" Decode.string)
        (Decode.field "uri" Decode.string)


type alias PlaylistTrack =
    { track : Track
    }


decodePlaylistTrack : Decode.Decoder PlaylistTrack
decodePlaylistTrack =
    Decode.map PlaylistTrack
        (Decode.field "track" decodeTrack)


type alias PlaylistPaging =
    { items : List PlaylistTrack
    , next : String
    }


decodePlaylistPaging : Decode.Decoder PlaylistPaging
decodePlaylistPaging =
    Decode.map2 PlaylistPaging
        (Decode.at [ "items" ] (Decode.list decodePlaylistTrack))
        (Decode.field "next" (Decode.oneOf [ string, null "" ]))

module Data.Playlist exposing
    ( Playlist
    , PlaylistPaging
    , PlaylistPagingSimplified
    , PlaylistSimplified
    , PlaylistTrack
    , decodePlaylist
    , decodePlaylistPaging
    , decodePlaylistPagingSimplified
    , decodePlaylistSimplified
    , decodePlaylistTrack
    , init
    )

import Data.Image
import Data.Track
import Json.Decode as Decode exposing (Decoder(..), at, field, null, string)


init : Playlist
init =
    { id = ""
    , images = []
    , name = ""
    , uri = ""
    }


type alias Playlist =
    { id : String
    , images : List Data.Image.Image
    , name : String
    , uri : String
    }


decodePlaylist : Decode.Decoder Playlist
decodePlaylist =
    Decode.map4 Playlist
        (Decode.field "id" Decode.string)
        (Decode.at [ "images" ] (Decode.list Data.Image.decodeImage))
        (Decode.field "name" Decode.string)
        (Decode.field "uri" Decode.string)


type alias PlaylistSimplified =
    { id : String
    , images : List Data.Image.Image
    , name : String
    , uri : String
    }


decodePlaylistSimplified : Decode.Decoder PlaylistSimplified
decodePlaylistSimplified =
    Decode.map4 PlaylistSimplified
        (Decode.field "id" Decode.string)
        (Decode.at [ "images" ] (Decode.list Data.Image.decodeImage))
        (Decode.field "name" Decode.string)
        (Decode.field "uri" Decode.string)


type alias PlaylistPagingSimplified =
    { items : List PlaylistSimplified
    , next : String
    }


decodePlaylistPagingSimplified : Decode.Decoder PlaylistPagingSimplified
decodePlaylistPagingSimplified =
    Decode.map2 PlaylistPagingSimplified
        (Decode.at [ "items" ] (Decode.list decodePlaylistSimplified))
        (Decode.field "next"
            (Decode.oneOf [ string, null "" ])
        )


type alias PlaylistTrack =
    { track : Data.Track.Track
    }


decodePlaylistTrack : Decode.Decoder PlaylistTrack
decodePlaylistTrack =
    Decode.map PlaylistTrack
        (Decode.field "track" Data.Track.decodeTrack)


type alias PlaylistPaging =
    { items : List PlaylistTrack
    , next : String
    }


decodePlaylistPaging : Decode.Decoder PlaylistPaging
decodePlaylistPaging =
    Decode.map2 PlaylistPaging
        (Decode.at [ "items" ] (Decode.list decodePlaylistTrack))
        (Decode.field "next"
            (Decode.oneOf [ string, null "" ])
        )

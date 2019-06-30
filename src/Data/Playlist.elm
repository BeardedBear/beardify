module Data.Playlist exposing
    ( Playlist
    , PlaylistId
    , PlaylistPaging
    , PlaylistPagingSimplified
    , PlaylistSimplified
    , decodePlaylist
    , decodePlaylistPaging
    , decodePlaylistPagingSimplified
    , decodePlaylistSimplified
    , decodePlaylistTrack
    , playlistInit
    )

import Data.Image exposing (Image, decodeImage)
import Data.Track exposing (Track, decodeTrack)
import Json.Decode as Decode exposing (Decoder(..), at, field, null, string)


type alias PlaylistId =
    String


playlistInit : Playlist
playlistInit =
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


decodePlaylistTrack : Decode.Decoder Track
decodePlaylistTrack =
    Decode.field "track" decodeTrack


type alias PlaylistPaging =
    { items : List Track
    , next : String
    }


decodePlaylistPaging : Decode.Decoder PlaylistPaging
decodePlaylistPaging =
    Decode.map2 PlaylistPaging
        (Decode.at [ "items" ] (Decode.list decodePlaylistTrack))
        (Decode.field "next"
            (Decode.oneOf [ string, null "" ])
        )

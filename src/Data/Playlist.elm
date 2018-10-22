module Data.Playlist exposing (Playlist, PlaylistPaging, PlaylistTrack, Playlists, Playlistslist, decodePlaylist, decodePlaylistPaging, decodePlaylistTrack, decodePlaylists, decodePlaylistslist, init)

import Data.Image exposing (..)
import Data.Track exposing (..)
import Http exposing (..)
import Json.Decode as Decode exposing (..)


init =
    []


type alias Playlistslist =
    { items : List Playlists
    }


decodePlaylistslist : Decode.Decoder Playlistslist
decodePlaylistslist =
    Decode.map Playlistslist
        (Decode.at [ "items" ] (Decode.list decodePlaylists))


type alias Playlists =
    { id : String
    , images : List Image
    , name : String
    , uri : String
    }


decodePlaylists : Decode.Decoder Playlists
decodePlaylists =
    Decode.map4 Playlists
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
    }


decodePlaylistPaging : Decode.Decoder PlaylistPaging
decodePlaylistPaging =
    Decode.map PlaylistPaging
        (Decode.at [ "items" ] (Decode.list decodePlaylistTrack))


type alias Playlist =
    { id : String
    , images : List Image
    , name : String
    , tracks : PlaylistPaging
    , uri : String
    }


decodePlaylist : Decode.Decoder Playlist
decodePlaylist =
    Decode.map5 Playlist
        (Decode.field "id" Decode.string)
        (Decode.at [ "images" ] (Decode.list decodeImage))
        (Decode.field "name" Decode.string)
        (Decode.field "tracks" decodePlaylistPaging)
        (Decode.field "uri" Decode.string)

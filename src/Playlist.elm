module Playlist exposing (Playlist, PlaylistPaging, PlaylistTrack, Playlists, Playlistslist, decodePlaylist, decodePlaylistPaging, decodePlaylistTrack, decodePlaylists, decodePlaylistslist, getPlaylist, getPlaylists, init)

import Http exposing (..)
import Image exposing (..)
import Json.Decode as Decode exposing (..)
import Task exposing (..)
import Track exposing (..)


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


getPlaylists : String -> Request Playlistslist
getPlaylists token =
    request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token
            ]
        , url = "https://api.spotify.com/v1/me/playlists"
        , body = Http.emptyBody
        , expect = Http.expectJson decodePlaylistslist
        , timeout = Nothing
        , withCredentials = False
        }


getPlaylist : String -> String -> Request Playlist
getPlaylist id token =
    request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token
            ]
        , url = "https://api.spotify.com/v1/playlists/" ++ id
        , body = Http.emptyBody
        , expect = Http.expectJson decodePlaylist
        , timeout = Nothing
        , withCredentials = False
        }

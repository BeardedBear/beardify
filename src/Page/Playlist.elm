module Page.Playlist exposing (Msg, init, update, view)

import Data.Meta
import Data.Playlist
import Data.Session
import Data.Track
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Http
import Request.Request as Request
import Utils
import Views.Playlist


init : Data.Session.Session -> ( Data.Meta.PlaylistModel, Cmd Msg )
init session =
    ( { playlist = Data.Playlist.init
      , tracks =
            { items = []
            , next = ""
            }
      }
    , Cmd.batch
        [ Http.send SetPlaylistTracks <| Request.get "playlists/" (Utils.getId session.url) "/tracks" Data.Playlist.decodePlaylistPaging session.token
        , Http.send SetPlaylist <| Request.get "playlists/" (Utils.getId session.url) "" Data.Playlist.decodePlaylist session.token
        ]
    )


type Msg
    = SetPlaylist (Result Http.Error Data.Playlist.Playlist)
    | SetPlaylistTracks (Result Http.Error Data.Playlist.PlaylistPaging)


update : Data.Session.Session -> Msg -> Data.Meta.PlaylistModel -> ( Data.Meta.PlaylistModel, Cmd Msg )
update session msg model =
    case msg of
        SetPlaylist (Ok e) ->
            ( { model | playlist = e }
            , Cmd.none
            )

        SetPlaylist (Err _) ->
            ( model, Cmd.none )

        SetPlaylistTracks (Ok e) ->
            let
                concat =
                    model.tracks.items ++ e.items
            in
            ( { model
                | tracks = { items = concat, next = "" }
              }
            , if e.next /= "" then
                Cmd.batch [ Http.send SetPlaylistTracks <| Request.getPaging e.next Data.Playlist.decodePlaylistPaging session.token ]

              else
                Cmd.none
            )

        SetPlaylistTracks (Err _) ->
            ( model, Cmd.none )


view : Data.Session.Session -> Data.Meta.PlaylistModel -> ( String, List (Html Msg) )
view session model =
    ( model.playlist.name, [ Views.Playlist.view model ] )

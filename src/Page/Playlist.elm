module Page.Playlist exposing (Msg, init, update, view)

import Data.Playlist
import Data.Root
import Data.Session exposing (Session)
import Data.Track
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Http
import Json.Decode as Decode exposing (..)
import Request.Request as Request
import Route
import Url exposing (Url, percentDecode)
import Url.Parser as Parser exposing ((</>), Parser)
import Utils
import Views.Playlist


init : Session -> ( Data.Root.PlaylistModel, Cmd Msg )
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
    = NoOp
    | SetPlaylist (Result Http.Error Data.Playlist.Playlist)
    | SetPlaylistTracks (Result Http.Error Data.Playlist.PlaylistPaging)
    | SetPlaylistTracksPaging (Result Http.Error Data.Playlist.PlaylistPaging)


update : Session -> Msg -> Data.Root.PlaylistModel -> ( Data.Root.PlaylistModel, Cmd Msg )
update session msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

        SetPlaylist (Ok e) ->
            ( { model | playlist = e }
            , Cmd.none
            )

        SetPlaylist (Err _) ->
            ( model, Cmd.none )

        SetPlaylistTracksPaging (Ok e) ->
            let
                concat =
                    model.tracks.items ++ e.items
            in
            ( { model
                | tracks = { items = concat, next = "" }
              }
            , if e.next /= "" then
                Cmd.batch [ Http.send SetPlaylistTracksPaging <| Request.getPaging e.next Data.Playlist.decodePlaylistPaging session.token ]

              else
                Cmd.none
            )

        SetPlaylistTracksPaging (Err _) ->
            ( model, Cmd.none )

        SetPlaylistTracks (Ok e) ->
            ( { model | tracks = e }
            , if e.next /= "" then
                Cmd.batch [ Http.send SetPlaylistTracksPaging <| Request.getPaging e.next Data.Playlist.decodePlaylistPaging session.token ]

              else
                Cmd.none
            )

        SetPlaylistTracks (Err _) ->
            ( model, Cmd.none )


view : Session -> Data.Root.PlaylistModel -> ( String, List (Html Msg) )
view session model =
    ( "model.album.name", [ Views.Playlist.view model ] )

module Page.Album exposing (Msg(..), init, update, view)

import Data.Album
import Data.Meta
import Data.Session
import Data.Track
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Http
import Json.Decode as Decode exposing (..)
import Meta
import Request.Request as Request
import Route
import Utils
import Views.Album


init : Data.Session.Session -> ( Data.Meta.AlbumModel, Cmd Msg )
init session =
    ( { album = Data.Album.init
      , tracks = []
      }
    , Cmd.batch
        [ Http.send SetAlbum <| Request.get "albums/" (Utils.getId session.url) "" Data.Album.decodeAlbum session.token
        , Http.send SetAlbumTracks <| Request.get "albums/" (Utils.getId session.url) "/tracks" (Decode.at [ "items" ] (Decode.list Data.Track.decodeTrackSimplified)) session.token
        ]
    )


type Msg
    = SetAlbum (Result Http.Error Data.Album.Album)
    | SetAlbumTracks (Result Http.Error (List Data.Track.TrackSimplified))


update : Data.Session.Session -> Msg -> Data.Meta.AlbumModel -> ( Data.Meta.AlbumModel, Cmd Msg )
update session msg model =
    case msg of
        SetAlbum (Ok e) ->
            ( { model | album = e }
            , Cmd.none
            )

        SetAlbum (Err _) ->
            ( model, Cmd.none )

        SetAlbumTracks (Ok e) ->
            ( { model | tracks = e }
            , Cmd.none
            )

        SetAlbumTracks (Err e) ->
            ( model, Cmd.none )


view : Data.Session.Session -> Data.Meta.AlbumModel -> ( String, List (Html msg) )
view session model =
    ( model.album.name, [ Views.Album.view model ] )

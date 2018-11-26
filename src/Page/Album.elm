module Page.Album exposing (Msg, init, update, view)

import Data.Album
import Data.Playlist as Playlist exposing (..)
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
import Views.Album


init : Session -> ( Data.Root.AlbumModel, Cmd Msg )
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
    = NoOp
    | SetAlbum (Result Http.Error Data.Album.Album)
    | SetAlbumTracks (Result Http.Error (List Data.Track.TrackSimplified))


update : Session -> Msg -> Data.Root.AlbumModel -> ( Data.Root.AlbumModel, Cmd Msg )
update session msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

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


view : Session -> Data.Root.AlbumModel -> ( String, List (Html Msg) )
view session model =
    ( model.album.name
    , [ div [ class "topbar" ] [ text "" ]
      , div [ class "drawer" ] [ Views.Album.view model ]
      , div [ class "player" ] [ text "player" ]
      ]
    )

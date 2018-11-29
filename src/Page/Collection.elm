module Page.Collection exposing (Msg, init, update, view)

import Data.Meta
import Data.Playlist
import Data.Session
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Http
import Request.Request as Request
import Route
import Utils
import Views.Collection


init : Data.Session.Session -> ( Data.Meta.CollectionModel, Cmd Msg )
init session =
    ( { collection = Data.Playlist.init
      , albums =
            { items = []
            , next = ""
            }
      }
    , Cmd.batch
        [ Http.send SetCollection <| Request.get "playlists/" (Utils.getId session.url) "" Data.Playlist.decodePlaylist session.token
        , Http.send SetCollectionTracks <| Request.get "playlists/" (Utils.getId session.url) "/tracks" Data.Playlist.decodePlaylistPaging session.token
        ]
    )


type Msg
    = SetCollection (Result Http.Error Data.Playlist.Playlist)
    | SetCollectionTracks (Result Http.Error Data.Playlist.PlaylistPaging)


update : Data.Session.Session -> Msg -> Data.Meta.CollectionModel -> ( Data.Meta.CollectionModel, Cmd Msg )
update session msg model =
    case msg of
        SetCollection (Ok e) ->
            ( { model | collection = e }
            , Cmd.none
            )

        SetCollection (Err e) ->
            ( model, Cmd.none )

        SetCollectionTracks (Ok e) ->
            let
                concat =
                    model.albums.items ++ e.items
            in
            ( { model
                | albums =
                    { items = concat
                    , next = ""
                    }
              }
            , if e.next /= "" then
                Cmd.batch [ Http.send SetCollectionTracks <| Request.getPaging e.next Data.Playlist.decodePlaylistPaging session.token ]

              else
                Cmd.none
            )

        SetCollectionTracks (Err e) ->
            ( model, Cmd.none )


view : Data.Session.Session -> Data.Meta.CollectionModel -> ( String, List (Html Msg) )
view session model =
    ( model.collection.name, [ Views.Collection.view model ] )

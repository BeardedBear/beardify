module Main exposing (main)

import Browser exposing (Document)
import Browser.Navigation as Nav
import Drawer exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Http exposing (..)
import Player exposing (..)
import Playlist exposing (..)
import Root exposing (..)
import Search exposing (..)
import Time exposing (..)
import Track exposing (..)
import Url exposing (Url)
import Utils
import View.Album as Album exposing (..)
import View.Artist as Artist exposing (..)
import View.Home as Home exposing (..)
import View.Player as Player exposing (..)
import View.Playlist as Playlist exposing (..)
import View.Search as Search exposing (..)
import View.Sidebar as Sidebar exposing (..)


type alias Flags =
    { token : String }


init : Flags -> Url -> Nav.Key -> ( Root.Model, Cmd Msg )
init flags url key =
    ( { config =
            { token = flags.token
            }
      , playlists = Playlist.init
      , drawer = Drawer.init
      , searchModel = Search.init
      , player = Player.init
      }
    , Cmd.batch
        [ Http.send GetPlaylists <| getPlaylists flags.token ]
    )


subscriptions : Root.Model -> Sub Msg
subscriptions model =
    Time.every 1000 SendPlayer


view : Root.Model -> Document Msg
view model =
    { title = "Beardify"
    , body =
        [ div [ class "app" ]
            [ Sidebar.view model
            , div [ class "content" ]
                [ div [ class "topbar" ]
                    [ Search.view model.searchModel
                    ]
                , div [ class "drawer" ]
                    [ case model.drawer.drawerType of
                        DrawArtist ->
                            Artist.view model.player model.drawer.drawerArtist

                        DrawAlbum ->
                            Album.view model.player model.drawer.drawerAlbum

                        DrawPlaylist ->
                            Playlist.view model.player model.drawer.drawerPlaylist

                        Home ->
                            Home.view

                        _ ->
                            text ""
                    ]
                , Player.view model.player
                ]
            ]
        ]
    }


main : Program Flags Root.Model Msg
main =
    Browser.application
        { init = init
        , view = view
        , update = Root.update
        , subscriptions = subscriptions
        , onUrlChange = UrlChanged
        , onUrlRequest = UrlRequested
        }

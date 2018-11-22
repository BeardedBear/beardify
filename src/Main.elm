module Main exposing (main)

import Browser exposing (Document)
import Browser.Events
import Browser.Navigation as Nav
import Data.Drawer as Drawer exposing (..)
import Data.Modal as Modal exposing (..)
import Data.Player as Player exposing (..)
import Data.Playlist as Playlist exposing (..)
import Data.Pocket as Pocket exposing (..)
import Data.Releases as Releases exposing (..)
import Data.Search as Search exposing (..)
import Data.Track exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http exposing (..)
import Json.Decode as Decode exposing (..)
import Keyboard.Event
import Ports
import Request
import Root exposing (..)
import Time exposing (..)
import Url exposing (Url)
import Utils
import View.Album as Album exposing (..)
import View.Artist as Artist exposing (..)
import View.Collection as Collection exposing (..)
import View.Home as Home exposing (..)
import View.Modal as Modal exposing (..)
import View.Player as Player exposing (..)
import View.Playlist as Playlist exposing (..)
import View.Releases as Releases
import View.Search as Search exposing (..)
import View.Sidebar as Sidebar exposing (..)


type alias Flags =
    { token : String
    , now : Int
    }


init : Flags -> Url -> Nav.Key -> ( Root.Model, Cmd Msg )
init flags url key =
    let
        timestamp =
            Time.millisToPosix flags.now
    in
    ( { config =
            { token = flags.token
            , openedMenu = False
            , currentDate =
                { year = Time.toYear utc timestamp
                , month = Time.toMonth utc timestamp
                , day = Time.toDay utc timestamp
                , hour = Time.toHour utc timestamp
                , minute = Time.toMinute utc timestamp
                , second = Time.toSecond utc timestamp
                , milliSecond = Time.toMillis utc timestamp
                }
            }
      , playlists = []
      , drawer = Drawer.init
      , searchModel = Search.init
      , player = Player.init
      , modal = Modal.init
      , releases = Releases.init
      , pocket = Pocket.init
      }
    , Cmd.batch
        [ Http.send SetPlaylists <|
            Request.get "me/playlists" "" "?limit=50" decodePlaylistPagingSimplified flags.token
        ]
    )


subscriptions : Root.Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Time.every 1000 GetPlayer
        , Browser.Events.onKeyDown (Decode.map HandleKeyboardEvent Keyboard.Event.decodeKeyboardEvent)
        , Ports.thePrpReleases AddReleaseThePrp
        ]


view : Root.Model -> Document Msg
view model =
    { title = "Beardify"
    , body =
        [ div [ class "app" ]
            [ Sidebar.view model
            , div [ class "content" ]
                [ div
                    [ classList
                        [ ( "pocket", True )
                        , ( "active", not <| List.isEmpty model.pocket.tracks )
                        ]
                    ]
                    [ div [ class "pocket-head" ]
                        [ span [] [ text ((List.length model.pocket.tracks |> String.fromInt) ++ " tracks in your pocket") ]
                        , button [ onClick PocketClear ] [ text "Clear" ]
                        ]
                    , div [ class "pocket-content" ]
                        [ div [ class "pocket-tracks" ]
                            (model.pocket.tracks
                                |> List.map
                                    (\y ->
                                        div [ class "pocket-track" ]
                                            [ div [ class "track-name" ] [ text y.track ]
                                            , div [ class "artist-name" ] [ text y.artist ]
                                            ]
                                    )
                            )
                        , viewPlaylists model.drawer model.playlists False
                        ]
                    ]
                , div [ class "topbar" ]
                    [ button [ onClick ToggleMenu, class "menu" ] [ text "menu" ]
                    , Search.view model.searchModel
                    ]
                , div [ class "drawer" ]
                    [ case model.drawer.drawerType of
                        DrawArtist ->
                            Artist.view model.player model.drawer.drawerArtist

                        DrawAlbum ->
                            Album.view model.pocket model.player model.drawer.drawerAlbum

                        DrawPlaylist ->
                            Playlist.view model.pocket model.player model.drawer.drawerPlaylist

                        DrawCollection ->
                            Collection.view model.player model.drawer.drawerCollection

                        Home ->
                            Home.view model

                        Releases ->
                            Releases.view model.player model

                        _ ->
                            text ""
                    ]
                , Player.view model.player
                ]
            , Modal.view model
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

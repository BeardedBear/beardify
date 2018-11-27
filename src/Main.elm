module Main exposing (main)

import Browser exposing (Document)
import Browser.Events
import Browser.Navigation as Nav
import Data.Album
import Data.Artist
import Data.Date as Date exposing (Date)
import Data.Meta
import Data.Player
import Data.Playlist exposing (..)
import Data.Search
import Data.Session exposing (Session)
import Data.Track
import Html.Styled as Html exposing (..)
import Http
import Json.Decode as Decode exposing (..)
import Keyboard.Event
import Meta
import Page.Album as Album
import Page.Artist as Artist
import Page.Collection as Collection
import Page.Counter as Counter
import Page.Home as Home
import Page.Playlist as Playlist
import Request.Request as Request
import Route exposing (Route)
import Time exposing (..)
import Url exposing (Url)
import Views.Meta
import Views.Page as Page


type alias Flags =
    { token : String
    , now : Int
    }


init : Flags -> Url -> Nav.Key -> ( Meta.Model, Cmd Meta.Msg )
init flags url navKey =
    let
        session =
            { navKey = navKey
            , playlists = []
            , url = url
            , token = flags.token
            , player = Data.Player.init
            , search = Data.Search.init
            }

        timestamp =
            Time.millisToPosix flags.now

        ( model, cmds ) =
            Meta.setRoute (Route.fromUrl url)
                { config =
                    { token = flags.token
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
                , page = Meta.Blank
                , session = session
                }
    in
    ( model
    , Cmd.batch
        [ cmds
        , Http.send Meta.InitPlaylist <| Request.get "me/playlists" "" "?limit=50" decodePlaylistPagingSimplified flags.token
        ]
    )


subscriptions : Meta.Model -> Sub Meta.Msg
subscriptions model =
    let
        commonSubs =
            [ Time.every 1000 Meta.GetPlayer
            , Browser.Events.onKeyDown (Decode.map Meta.HandleKeyboardEvent Keyboard.Event.decodeKeyboardEvent)
            ]
    in
    case model.page of
        Meta.HomePage _ ->
            Sub.batch commonSubs

        Meta.CounterPage _ ->
            Sub.batch commonSubs

        Meta.CollectionPage _ ->
            Sub.batch commonSubs

        Meta.PlaylistPage _ ->
            Sub.batch commonSubs

        Meta.AlbumPage _ ->
            Sub.batch commonSubs

        Meta.ArtistPage _ ->
            Sub.batch commonSubs

        Meta.NotFound ->
            Sub.batch commonSubs

        Meta.Blank ->
            Sub.batch commonSubs


view : Meta.Model -> Document Meta.Msg
view model =
    let
        pageConfig =
            Views.Meta.Config model.session

        mapMsg msg ( title, content ) =
            ( title, content |> List.map (Html.map msg) )
    in
    case model.page of
        Meta.HomePage homeModel ->
            Home.view model.session homeModel
                |> mapMsg Meta.HomeMsg
                |> Page.frame (pageConfig Views.Meta.Home)

        Meta.CounterPage counterModel ->
            Counter.view model.session counterModel
                |> mapMsg Meta.CounterMsg
                |> Page.frame (pageConfig Views.Meta.Counter)

        Meta.CollectionPage collectionModel ->
            Collection.view model.session collectionModel
                |> mapMsg Meta.CollectionMsg
                |> Page.frame (pageConfig Views.Meta.Collection)

        Meta.PlaylistPage playlistModel ->
            Playlist.view model.session playlistModel
                |> mapMsg Meta.PlaylistMsg
                |> Page.frame (pageConfig Views.Meta.Playlist)

        Meta.AlbumPage albumModel ->
            Album.view model.session albumModel
                |> mapMsg Meta.AlbumMsg
                |> Page.frame (pageConfig Views.Meta.Album)

        Meta.ArtistPage artistModel ->
            Artist.view model.session artistModel
                |> mapMsg Meta.ArtistMsg
                |> Page.frame (pageConfig Views.Meta.Artist)

        Meta.NotFound ->
            ( "Not Found", [ Html.text "Not found" ] )
                |> Page.frame (pageConfig Views.Meta.Other)

        Meta.Blank ->
            ( "", [] )
                |> Page.frame (pageConfig Views.Meta.Other)


main : Program Flags Meta.Model Meta.Msg
main =
    Browser.application
        { init = init
        , view = view
        , update = Meta.update
        , subscriptions = subscriptions
        , onUrlChange = Meta.UrlChanged
        , onUrlRequest = Meta.UrlRequested
        }

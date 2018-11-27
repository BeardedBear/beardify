module Meta exposing (Model, Msg(..), Page(..), setRoute, update)

import Browser exposing (Document)
import Browser.Dom
import Browser.Navigation as Nav
import Data.Album
import Data.Artist
import Data.Date as Date exposing (Date)
import Data.Meta
import Data.Player
import Data.Playlist
import Data.Search
import Data.Session
import Data.Track
import Html.Styled as Html exposing (..)
import Http
import Json.Decode as Decode exposing (..)
import Keyboard.Event
import Page.Album
import Page.Artist
import Page.Collection
import Page.Counter
import Page.Home
import Page.Playlist
import Request.Request as Request
import Route
import Task
import Time exposing (..)
import Url exposing (Url)


setRoute : Maybe Route.Route -> Model -> ( Model, Cmd Msg )
setRoute maybeRoute model =
    let
        toPage page subInit subMsg =
            let
                ( subModel, subCmds ) =
                    subInit model.session
            in
            ( { model | page = page subModel }
            , Cmd.map subMsg subCmds
            )
    in
    case maybeRoute of
        Nothing ->
            ( { model | page = NotFound }
            , Cmd.none
            )

        Just Route.Home ->
            toPage HomePage Page.Home.init HomeMsg

        Just Route.Counter ->
            toPage CounterPage Page.Counter.init CounterMsg

        Just (Route.Collection id) ->
            toPage CollectionPage Page.Collection.init CollectionMsg

        Just (Route.Playlist id) ->
            toPage PlaylistPage Page.Playlist.init PlaylistMsg

        Just (Route.Album id) ->
            toPage AlbumPage Page.Album.init AlbumMsg

        Just (Route.Artist id) ->
            toPage ArtistPage Page.Artist.init ArtistMsg


type Page
    = Blank
    | HomePage Page.Home.Model
    | CounterPage Page.Counter.Model
    | CollectionPage Data.Meta.CollectionModel
    | PlaylistPage Data.Meta.PlaylistModel
    | AlbumPage Data.Meta.AlbumModel
    | ArtistPage Data.Meta.ArtistModel
    | NotFound


type alias Model =
    { config :
        { token : String
        , currentDate : Date
        }
    , page : Page
    , session : Data.Session.Session
    }


type Msg
    = NoOp
    | HomeMsg Page.Home.Msg
    | CounterMsg Page.Counter.Msg
    | CollectionMsg Page.Collection.Msg
    | PlaylistMsg Page.Playlist.Msg
    | AlbumMsg Page.Album.Msg
    | ArtistMsg Page.Artist.Msg
    | UrlChanged Url
    | UrlRequested Browser.UrlRequest
      -- SIDEBAR PLAYLISTS
    | InitPlaylist (Result Http.Error Data.Playlist.PlaylistPagingSimplified)
    | InitPlaylistPaging (Result Http.Error Data.Playlist.PlaylistPagingSimplified)
      -- PLAYER
    | SetPlayer (Result Http.Error Data.Player.Model)
    | GetPlayer Posix
      -- SEARCH
    | FindArtist (Result Http.Error (List Data.Artist.Artist))
    | FindAlbum (Result Http.Error (List Data.Album.Album))
    | FindTrack (Result Http.Error (List Data.Track.Track))
    | Query String
      -- KEYBOARD
    | HandleKeyboardEvent Keyboard.Event.KeyboardEvent
      -- PLAYING
    | Play (Result Http.Error ())
    | ChangePlaying String
    | ChangePlayingTrack (List String)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ page, session } as model) =
    let
        toPage toModel toMsg subUpdate subMsg subModel =
            let
                ( newModel, newCmd ) =
                    subUpdate subMsg subModel
            in
            ( { model | page = toModel newModel }
            , Cmd.map toMsg newCmd
            )

        token =
            model.config.token

        search =
            model.session.search
    in
    case ( msg, page ) of
        ( NoOp, _ ) ->
            ( model, Cmd.none )

        ( HomeMsg homeMsg, HomePage homeModel ) ->
            toPage HomePage HomeMsg (Page.Home.update session) homeMsg homeModel

        ( CounterMsg counterMsg, CounterPage counterModel ) ->
            toPage CounterPage CounterMsg (Page.Counter.update session) counterMsg counterModel

        ( CollectionMsg collectionMsg, CollectionPage collectionModel ) ->
            toPage CollectionPage CollectionMsg (Page.Collection.update session) collectionMsg collectionModel

        ( PlaylistMsg playlistMsg, PlaylistPage playlistModel ) ->
            toPage PlaylistPage PlaylistMsg (Page.Playlist.update session) playlistMsg playlistModel

        ( AlbumMsg albumMsg, AlbumPage albumModel ) ->
            toPage AlbumPage AlbumMsg (Page.Album.update session) albumMsg albumModel

        ( ArtistMsg artistMsg, ArtistPage artistModel ) ->
            toPage ArtistPage ArtistMsg (Page.Artist.update session) artistMsg artistModel

        ( UrlRequested urlRequest, _ ) ->
            case urlRequest of
                Browser.Internal url ->
                    ( { model | session = { session | url = url } }, Nav.pushUrl session.navKey (Url.toString url) )

                Browser.External href ->
                    ( model, Nav.load href )

        ( UrlChanged url, _ ) ->
            setRoute (Route.fromUrl url) { model | session = { session | url = url } }

        ( _, NotFound ) ->
            ( { model | page = NotFound }, Cmd.none )

        -- SIDEBAR PLAYLISTS
        ( InitPlaylistPaging (Ok e), _ ) ->
            let
                concat =
                    model.session.playlists ++ e.items
            in
            ( { model | session = { session | playlists = concat } }
            , if e.next /= "" then
                Cmd.batch [ Http.send InitPlaylistPaging <| Request.getPaging e.next Data.Playlist.decodePlaylistPagingSimplified token ]

              else
                Cmd.none
            )

        ( InitPlaylistPaging (Err _), _ ) ->
            ( model, Cmd.none )

        ( InitPlaylist (Ok e), _ ) ->
            ( { model | session = { session | playlists = e.items } }
            , if e.next /= "" then
                Cmd.batch [ Http.send InitPlaylistPaging <| Request.getPaging e.next Data.Playlist.decodePlaylistPagingSimplified token ]

              else
                Cmd.none
            )

        ( InitPlaylist (Err e), _ ) ->
            ( model, Cmd.none )

        -- PLAYER
        ( SetPlayer (Ok e), _ ) ->
            ( { model | session = { session | player = e } }, Cmd.none )

        ( SetPlayer (Err _), _ ) ->
            ( model, Cmd.none )

        ( GetPlayer _, _ ) ->
            ( model, Http.send SetPlayer <| Request.get "me/player" "" "" Data.Player.decodePlayer token )

        -- SEARCH
        ( FindArtist (Ok artist), _ ) ->
            ( { model | session = { session | search = { search | findArtist = artist } } }
            , Cmd.none
            )

        ( FindArtist (Err _), _ ) ->
            ( model, Cmd.none )

        ( FindAlbum (Ok album), _ ) ->
            ( { model | session = { session | search = { search | findAlbum = album } } }
            , Cmd.none
            )

        ( FindAlbum (Err _), _ ) ->
            ( model, Cmd.none )

        ( FindTrack (Ok track), _ ) ->
            ( { model | session = { session | search = { search | findTrack = track } } }
            , Cmd.none
            )

        ( FindTrack (Err _), _ ) ->
            ( model, Cmd.none )

        ( Query e, _ ) ->
            ( { model | session = { session | search = { search | searchQuery = e } } }
            , Cmd.batch
                [ Http.send FindArtist <| Request.get "search?q=" (e ++ "*") "&type=artist&limit=10" (Decode.at [ "artists", "items" ] (Decode.list Data.Artist.decodeArtist)) token
                , Http.send FindAlbum <| Request.get "search?q=" (e ++ "*") "&type=album&limit=9" (Decode.at [ "albums", "items" ] (Decode.list Data.Album.decodeAlbum)) token
                , Http.send FindTrack <| Request.get "search?q=" (e ++ "*") "&type=track&limit=12" (Decode.at [ "tracks", "items" ] (Decode.list Data.Track.decodeTrack)) token
                ]
            )

        -- KEYBOARD
        ( HandleKeyboardEvent event, _ ) ->
            case ( event.shiftKey, event.key ) of
                ( _, Just "Escape" ) ->
                    ( { model
                        | session = { session | search = { search | searchQuery = "" } }

                        -- , modal = { modal | isOpen = False }
                      }
                    , Cmd.none
                    )

                -- ( _, Just " " ) ->
                --     if player.is_playing && model.searchModel.searchQuery == "" then
                --         ( model, Http.send PlayerControl <| Request.put "" "pause" "" token )
                --     else
                --         ( model, Http.send PlayerControl <| Request.put "" "play" "" token )
                ( True, Just "F" ) ->
                    ( model, Task.attempt (\_ -> NoOp) (Browser.Dom.focus "search") )

                ( _, _ ) ->
                    ( model, Cmd.none )

        -- PLAYING
        ( Play (Ok e), _ ) ->
            ( model, Cmd.none )

        ( Play (Err _), _ ) ->
            ( model, Cmd.none )

        ( ChangePlaying e, _ ) ->
            ( model, Http.send Play <| Request.play e (Data.Album.encodeAlbum e) token )

        ( ChangePlayingTrack e, _ ) ->
            ( { model | session = { session | search = { search | searchQuery = "" } } }
            , Http.send Play <| Request.play e (Data.Track.encodeTrack e) token
            )

        ( _, _ ) ->
            ( model, Cmd.none )

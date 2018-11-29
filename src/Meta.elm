module Meta exposing (Model, Msg(..), Page(..), update)

import Browser exposing (Document)
import Browser.Dom
import Browser.Navigation as Nav
import Data.Album
import Data.Artist
import Data.Counter
import Data.Date as Date exposing (Date)
import Data.Home
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
import Request.Request as Request
import Route
import Task
import Time exposing (..)
import Url exposing (Url)


type alias Model =
    { config :
        { token : String
        , currentDate : Date
        }
    , page : Page
    , session : Data.Session.Session
    }


type Page
    = Blank
    | HomePage Data.Home.Model
    | CounterPage Data.Counter.Model
    | CollectionPage Data.Meta.CollectionModel
    | PlaylistPage Data.Meta.PlaylistModel
    | AlbumPage Data.Meta.AlbumModel
    | ArtistPage Data.Meta.ArtistModel
    | NotFound


type Msg
    = NoOp
      -- SEARCH
    | FindArtist (Result Http.Error (List Data.Artist.Artist))
    | FindAlbum (Result Http.Error (List Data.Album.Album))
    | FindTrack (Result Http.Error (List Data.Track.Track))
    | Query String
      -- PLAYING
    | Play (Result Http.Error ())
    | ChangePlaying String
    | ChangePlayingTrack (List String)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ session } as model) =
    let
        token =
            model.config.token

        search =
            model.session.search
    in
    case msg of
        NoOp ->
            ( model, Cmd.none )

        -- SEARCH
        FindArtist (Ok artist) ->
            ( { model | session = { session | search = { search | findArtist = artist } } }
            , Cmd.none
            )

        FindArtist (Err _) ->
            ( model, Cmd.none )

        FindAlbum (Ok album) ->
            ( { model | session = { session | search = { search | findAlbum = album } } }
            , Cmd.none
            )

        FindAlbum (Err _) ->
            ( model, Cmd.none )

        FindTrack (Ok track) ->
            ( { model | session = { session | search = { search | findTrack = track } } }
            , Cmd.none
            )

        FindTrack (Err _) ->
            ( model, Cmd.none )

        Query e ->
            ( { model | session = { session | search = { search | searchQuery = e } } }
            , Cmd.batch
                [ Http.send FindArtist <| Request.get "search?q=" (e ++ "*") "&type=artist&limit=10" (Decode.at [ "artists", "items" ] (Decode.list Data.Artist.decodeArtist)) token
                , Http.send FindAlbum <| Request.get "search?q=" (e ++ "*") "&type=album&limit=9" (Decode.at [ "albums", "items" ] (Decode.list Data.Album.decodeAlbum)) token
                , Http.send FindTrack <| Request.get "search?q=" (e ++ "*") "&type=track&limit=12" (Decode.at [ "tracks", "items" ] (Decode.list Data.Track.decodeTrack)) token
                ]
            )

        -- PLAYING
        Play (Ok e) ->
            ( model, Cmd.none )

        Play (Err _) ->
            ( model, Cmd.none )

        ChangePlaying e ->
            ( model, Http.send Play <| Request.play e (Data.Album.encodeAlbum e) token )

        ChangePlayingTrack e ->
            ( { model | session = { session | search = { search | searchQuery = "" } } }
            , Http.send Play <| Request.play e (Data.Track.encodeTrack e) token
            )

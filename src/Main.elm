module Main exposing (main)

import Base64
import Browser exposing (Document)
import Browser.Navigation as Nav
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http exposing (..)
import Json.Decode as Decode exposing (..)
import Json.Encode as Encode
import Search.Decoders
import Search.Requests
import Search.Search
import Types exposing (..)
import Url exposing (Url)
import Utils


type alias Flags =
    {}


type alias Model =
    { searchModel : Search.Search.Model
    }


init : Flags -> Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url key =
    ( { searchModel = Search.Search.init
      }
    , Cmd.none
    )



-- update2 : Msg -> Model -> ( Model, Cmd Msg )
-- update2 msg model =
--     case msg of
--         NoOp ->
--             ( model, Cmd.none )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ searchModel } as model) =
    case msg of
        NoOp ->
            ( model, Cmd.none )

        UrlChanged url ->
            ( model, Cmd.none )

        UrlRequested urlRequest ->
            ( model, Cmd.none )

        FindArtist (Ok artist) ->
            ( { model | searchModel = { searchModel | findArtist = artist.items } }, Cmd.none )

        FindArtist (Err _) ->
            ( model, Cmd.none )

        FindAlbum (Ok album) ->
            ( { model | searchModel = { searchModel | findAlbum = album.items } }, Cmd.none )

        FindAlbum (Err _) ->
            ( model, Cmd.none )

        FindTrack (Ok track) ->
            ( { model | searchModel = { searchModel | findTrack = track.items } }, Cmd.none )

        FindTrack (Err _) ->
            ( model, Cmd.none )

        Play (Ok _) ->
            ( model, Cmd.none )

        Play (Err _) ->
            ( model, Cmd.none )

        PlayTrack (Ok _) ->
            ( model, Cmd.none )

        PlayTrack (Err _) ->
            ( model, Cmd.none )

        Query e ->
            ( { model | searchModel = { searchModel | searchQuery = e } }
            , Cmd.batch
                [ Search.Requests.searchCmdArtist e "artist"
                , Search.Requests.searchCmdAlbum e "album"
                , Search.Requests.searchCmdTrack e "track"
                ]
            )

        ChangePlaying e ->
            ( model, Search.Requests.playCmd e )

        ChangePlayingTrack e ->
            ( model, Search.Requests.playTrackCmd e )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


view : Model -> Document Msg
view model =
    { title = ""
    , body =
        [ Search.Search.view model.searchModel
        ]
    }


main : Program Flags Model Msg
main =
    Browser.application
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        , onUrlChange = UrlChanged
        , onUrlRequest = UrlRequested
        }

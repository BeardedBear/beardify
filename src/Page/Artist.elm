module Page.Artist exposing (Msg, init, update, view)

import Data.Album
import Data.Artist
import Data.Playlist as Playlist exposing (..)
import Data.Root
import Data.Session exposing (Session)
import Data.Track
import Data.Youtube
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
import Views.Artist



-- type alias ArtistModel =
--     { artist : Data.Artist.Artist
--     , albums : List Data.Album.Album
--     , videos : List Data.Youtube.Video
--     , topTracks : List Data.Track.Track
--     , relatedArtists : List Data.Artist.Artist
--     }


init : Session -> ( Data.Root.ArtistModel, Cmd Msg )
init session =
    ( { artist = Data.Artist.init
      , albums = []
      , videos = []
      , topTracks = []
      , relatedArtists = []
      }
    , Cmd.batch
        [ Http.send SetArtist <| Request.get "artists/" (Utils.getId session.url) "" Data.Artist.decodeArtist session.token
        , Http.send SetArtistAlbums <| Request.get "artists/" (Utils.getId session.url) "/albums?market=FR&album_type=album" (Decode.at [ "items" ] (Decode.list Data.Album.decodeAlbum)) session.token
        , Http.send SetArtistTopTracks <| Request.get "artists/" (Utils.getId session.url) "/top-tracks?country=FR" (Decode.at [ "tracks" ] (Decode.list Data.Track.decodeTrack)) session.token
        , Http.send SetRelatedArtists <| Request.get "artists/" (Utils.getId session.url) "/related-artists" (Decode.at [ "artists" ] (Decode.list Data.Artist.decodeArtist)) session.token
        ]
    )


type Msg
    = NoOp
    | SetArtist (Result Http.Error Data.Artist.Artist)
    | SetArtistAlbums (Result Http.Error (List Data.Album.Album))
    | SetArtistTopTracks (Result Http.Error (List Data.Track.Track))
    | SetRelatedArtists (Result Http.Error (List Data.Artist.Artist))
    | SetYoutube (Result Http.Error Data.Youtube.Youtube)


update : Session -> Msg -> Data.Root.ArtistModel -> ( Data.Root.ArtistModel, Cmd Msg )
update session msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

        SetArtist (Ok e) ->
            ( { model | artist = e }
            , Cmd.batch
                [ Http.send SetYoutube <| Data.Youtube.getVideos e.name
                ]
            )

        SetArtist (Err _) ->
            ( model, Cmd.none )

        SetArtistAlbums (Ok e) ->
            ( { model | albums = e }
            , Cmd.none
            )

        SetArtistAlbums (Err _) ->
            ( model, Cmd.none )

        SetArtistTopTracks (Ok e) ->
            ( { model | topTracks = e }, Cmd.none )

        SetArtistTopTracks (Err _) ->
            ( model, Cmd.none )

        SetRelatedArtists (Ok e) ->
            ( { model | relatedArtists = e }, Cmd.none )

        SetRelatedArtists (Err _) ->
            ( model, Cmd.none )

        SetYoutube (Ok e) ->
            ( { model | videos = e.items }, Cmd.none )

        SetYoutube (Err _) ->
            ( model, Cmd.none )


view : Session -> Data.Root.ArtistModel -> ( String, List (Html Msg) )
view session model =
    ( "Artist"
    , [ div [ class "topbar" ] [ text "" ]
      , div [ class "drawer" ] [ Views.Artist.view model ]
      , div [ class "player" ] [ text "player" ]
      ]
    )

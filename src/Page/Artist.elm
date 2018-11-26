module Page.Artist exposing (Msg, init, update, view)

import Data.Artist
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
        [--     Http.send SetAlbum <| Request.get "albums/" (Utils.getId session.url) "" Data.Album.decodeAlbum session.token
         -- , Http.send SetAlbumTracks <| Request.get "albums/" (Utils.getId session.url) "/tracks" (Decode.at [ "items" ] (Decode.list Data.Track.decodeTrackSimplified)) session.token
        ]
    )


type Msg
    = NoOp


update : Session -> Msg -> Data.Root.ArtistModel -> ( Data.Root.ArtistModel, Cmd Msg )
update session msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )


view : Session -> Data.Root.ArtistModel -> ( String, List (Html Msg) )
view session model =
    ( "Artist"
    , [ div [ class "topbar" ] [ text "" ]
      , div [ class "drawer" ] [ text "artist" ]
      , div [ class "player" ] [ text "player" ]
      ]
    )

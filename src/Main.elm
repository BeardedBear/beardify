module Main exposing (main)

-- import

import Album exposing (..)
import Artist exposing (..)
import Base64
import Browser exposing (Document)
import Browser.Navigation as Nav
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http exposing (..)
import Json.Decode as Decode exposing (..)
import Json.Encode as Encode
import Token exposing (..)
import Track exposing (..)
import Url exposing (Url)
import Utils


type alias Flags =
    {}


type alias Model =
    { token : Token
    , searchModel :
        { findArtist : List Artist
        , findAlbum : List Album
        , findTrack : List Track
        , searchQuery : String
        }
    }


init : Flags -> Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url key =
    ( { token = { token = "" }
      , searchModel =
            { findArtist = []
            , findAlbum = []
            , findTrack = []
            , searchQuery = ""
            }
      }
    , Http.send GetToken <| Http.get "token.json" decodeToken
    )


type Msg
    = UrlChanged Url
    | UrlRequested Browser.UrlRequest
    | GetToken (Result Http.Error Token)
    | FindArtist (Result Http.Error ListArtist)
    | FindAlbum (Result Http.Error ListAlbum)
    | FindTrack (Result Http.Error ListTrack)
    | PlayAlbum (Result Http.Error ())
    | PlayTrack (Result Http.Error ())
    | Query String
    | ChangePlaying String
    | ChangePlayingTrack (List String)



-- | SMsg Msg


update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ searchModel } as model) =
    case msg of
        UrlChanged url ->
            ( model, Cmd.none )

        UrlRequested urlRequest ->
            ( model, Cmd.none )

        GetToken (Ok e) ->
            let
                _ =
                    Debug.log "e" e
            in
            ( { model | token = e }, Cmd.none )

        GetToken (Err e) ->
            let
                _ =
                    Debug.log "e" e
            in
            ( { model | token = { token = "oups" } }, Cmd.none )

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

        PlayAlbum (Ok _) ->
            ( model, Cmd.none )

        PlayAlbum (Err _) ->
            ( model, Cmd.none )

        PlayTrack (Ok _) ->
            ( model, Cmd.none )

        PlayTrack (Err _) ->
            ( model, Cmd.none )

        Query e ->
            ( { model | searchModel = { searchModel | searchQuery = e } }
            , Cmd.batch
                [ Http.send FindArtist <| search e "artist" decodeListArtist model.token
                , Http.send FindAlbum <| search e "album" decodeListAlbum model.token
                , Http.send FindTrack <| search e "track" decodeListTrack model.token
                ]
            )

        ChangePlaying e ->
            ( model, Http.send PlayAlbum <| playAlbum e model.token )

        ChangePlayingTrack e ->
            ( model, Http.send PlayTrack <| playTrack e model.token )


search : String -> String -> Decode.Decoder a -> Token -> Request a
search query type_ decoder token =
    request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token.token
            ]
        , url = "https://api.spotify.com/v1/search?q=" ++ query ++ "&type=" ++ type_
        , body = Http.emptyBody
        , expect = Http.expectJson decoder
        , timeout = Nothing
        , withCredentials = False
        }



-- PLAY


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


coverView : List Cover -> Html Msg
coverView cover =
    cover
        |> List.reverse
        |> List.head
        |> Maybe.withDefault { url = "" }
        |> (\c -> img [ src c.url ] [])


searchView : Model -> Html Msg
searchView model =
    div []
        [ div [] [ input [ type_ "text", onInput Query, Html.Attributes.value model.searchModel.searchQuery ] [] ]
        , span [] [ text model.token.token ]
        , div [ style "float" "left", style "width" "300px" ]
            [ h2 [] [ text "Artists" ]
            , List.map (\a -> li [] [ text a.name ]) model.searchModel.findArtist
                |> ul [ style "list-style" "none", style "padding" "0" ]
            ]
        , div [ style "float" "left", style "width" "300px" ]
            [ h2 [] [ text "Albums" ]
            , model.searchModel.findAlbum
                |> List.filter (\a -> a.album_type == "album")
                |> List.map
                    (\a ->
                        li [ style "clear" "both", style "margin-bottom" "10px" ]
                            [ div [ class "search-cover-image", onClick (ChangePlaying a.uri) ] [ coverView a.images ]
                            , strong [] [ text <| a.name ++ " " ]
                            , text <| "(" ++ Utils.releaseDateFormat a.release_date ++ ")"
                            , br [] []
                            , small [] (List.map (\artists -> text artists.name) a.artists)
                            ]
                    )
                |> ul [ style "list-style" "none", style "padding" "0" ]
            ]
        , div [ style "float" "left" ]
            [ h2 [] [ text "Tracks" ]
            , List.map
                (\t ->
                    li []
                        [ div [ onClick (ChangePlayingTrack [ t.uri ]), class "track-icon" ] [ text "🎵 " ]
                        , strong [] [ text t.name ]
                        , br [] []
                        , small [] (List.map (\artists -> text <| artists.name) t.artists)
                        , span [] [ text " - " ]
                        , small [] [ text t.album.name ]
                        , span [ style "float" "right" ]
                            [ text (Utils.durationFormat t.duration_ms)
                            ]
                        ]
                )
                model.searchModel.findTrack
                |> ul [ style "list-style" "none", style "padding" "0" ]
            ]
        ]


view : Model -> Document Msg
view model =
    { title = ""
    , body =
        [ searchView model
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

module Main exposing (main)

-- import

import Album exposing (..)
import Artist exposing (..)
import Base64
import Browser exposing (Document)
import Browser.Navigation as Nav
import Css exposing (..)
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


type alias ShowArtist =
    { artist : Artist
    , albums : List Album
    }


type DrawerType
    = DrawArtist String
    | DrawAlbum String
    | None


type alias SearchModel =
    { findArtist : List Artist
    , findAlbum : List Album
    , findTrack : List Track
    , searchQuery : String
    }


type alias Model =
    { token : Token
    , drawerContent : ShowArtist
    , searchModel : SearchModel
    }


init : Flags -> Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url key =
    ( { token = { token = "" }
      , drawerContent =
            { artist =
                { id = ""
                , name = ""
                , type_ = ""
                }
            , albums = []
            }
      , searchModel =
            { findArtist = []
            , findAlbum = []
            , findTrack = []
            , searchQuery = ""
            }
      }
    , Cmd.batch
        [ Http.send GetToken <| Http.get "token.json" decodeToken
        ]
    )


type Msg
    = UrlChanged Url
    | UrlRequested Browser.UrlRequest
    | GetToken (Result Http.Error Token)
    | Get String
    | GetArtist (Result Http.Error Artist)
    | GetArtistAlbums (Result Http.Error ListAlbum)
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
update msg ({ searchModel, token, drawerContent } as model) =
    case msg of
        UrlChanged url ->
            ( model, Cmd.none )

        UrlRequested urlRequest ->
            ( model, Cmd.none )

        GetToken (Ok e) ->
            ( { model | token = e }, Cmd.none )

        GetToken (Err _) ->
            ( model, Cmd.none )

        Get e ->
            ( model
            , Cmd.batch
                [ Http.send GetArtist <| getArtist e decodeArtist token
                , Http.send GetArtistAlbums <| getArtistAlbums e decodeArtistAlbums token
                ]
            )

        GetArtist (Ok e) ->
            ( { model
                | drawerContent = { drawerContent | artist = e }
                , searchModel = { searchModel | searchQuery = "" }
              }
            , Cmd.none
            )

        GetArtist (Err _) ->
            ( model, Cmd.none )

        GetArtistAlbums (Ok e) ->
            ( { model
                | drawerContent = { drawerContent | albums = e.items }
                , searchModel = { searchModel | searchQuery = "" }
              }
            , Cmd.none
            )

        GetArtistAlbums (Err _) ->
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
                [ Http.send FindArtist <| search e "artist" 20 decodeListArtist token
                , Http.send FindAlbum <| search e "album" 13 decodeListAlbum token
                , Http.send FindTrack <| search e "track" 16 decodeListTrack token
                ]
            )

        ChangePlaying e ->
            ( model, Http.send PlayAlbum <| playAlbum e token )

        ChangePlayingTrack e ->
            ( model, Http.send PlayTrack <| playTrack e token )


search : String -> String -> Int -> Decode.Decoder a -> Token -> Request a
search query type_ limit decoder token =
    request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token.token
            ]
        , url = "https://api.spotify.com/v1/search?q=" ++ query ++ "&type=" ++ type_ ++ "&limit=" ++ String.fromInt limit
        , body = Http.emptyBody
        , expect = Http.expectJson decoder
        , timeout = Nothing
        , withCredentials = False
        }


getArtist : String -> Decode.Decoder a -> Token -> Request a
getArtist id decoder token =
    request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token.token
            ]
        , url = "https://api.spotify.com/v1/artists/" ++ id
        , body = Http.emptyBody
        , expect = Http.expectJson decoder
        , timeout = Nothing
        , withCredentials = False
        }


getArtistAlbums : String -> Decode.Decoder a -> Token -> Request a
getArtistAlbums id decoder token =
    request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token.token
            ]
        , url = "https://api.spotify.com/v1/artists/" ++ id ++ "/albums" ++ "?market=FR&album_type=album"
        , body = Http.emptyBody
        , expect = Http.expectJson decoder
        , timeout = Nothing
        , withCredentials = False
        }


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- VIEWS


type CoverSize
    = Small
    | Medium
    | Large


coverView : CoverSize -> List Cover -> Html Msg
coverView size cover =
    case size of
        Small ->
            cover
                |> List.reverse
                |> List.head
                |> Maybe.withDefault { url = "" }
                |> (\c -> img [ src c.url ] [])

        Medium ->
            text ""

        Large ->
            cover
                |> List.head
                |> Maybe.withDefault { url = "" }
                |> (\c -> img [ src c.url ] [])


searchView : SearchModel -> Html Msg
searchView searchModel =
    div [ class "search" ]
        [ div [] [ input [ placeholder "Recherche", type_ "text", onInput Query, Html.Attributes.value searchModel.searchQuery ] [] ]
        , if searchModel.searchQuery /= "" then
            div [ class "results" ]
                [ div []
                    [ div [ class "title" ] [ text "Artists" ]
                    , List.map (\a -> li [ onClick (Get a.id) ] [ text a.name ]) searchModel.findArtist
                        |> ul [ style "list-style" "none", style "padding" "0" ]
                    ]
                , div []
                    [ div [ class "title" ] [ text "Albums" ]
                    , searchModel.findAlbum
                        |> List.filter (\a -> a.album_type == "album")
                        |> List.map
                            (\a ->
                                li [ style "clear" "both", style "margin-bottom" "10px" ]
                                    [ div [ class "search-cover-image", onClick (ChangePlaying a.uri) ] [ coverView Small a.images ]
                                    , strong [] [ text <| a.name ++ " " ]
                                    , text <| "(" ++ Utils.releaseDateFormat a.release_date ++ ")"
                                    , br [] []
                                    , Html.small [] (List.map (\artists -> text artists.name) a.artists)
                                    ]
                            )
                        |> ul [ style "list-style" "none", style "padding" "0" ]
                    ]
                , div []
                    [ div [ class "title" ] [ text "Tracks" ]
                    , List.map
                        (\t ->
                            li []
                                [ div [ onClick (ChangePlayingTrack [ t.uri ]), class "track-icon" ] [ text "🎵 " ]
                                , strong [] [ text t.name ]
                                , br [] []
                                , Html.small [] (List.map (\artists -> text <| artists.name) t.artists)
                                , span [] [ text " - " ]
                                , Html.small [] [ text t.album.name ]
                                , span [ style "float" "right" ]
                                    [ text (Utils.durationFormat t.duration_ms)
                                    ]
                                ]
                        )
                        searchModel.findTrack
                        |> ul [ style "list-style" "none", style "padding" "0" ]
                    ]
                ]

          else
            text ""
        ]


coverViewBig : List Cover -> Html Msg
coverViewBig cover =
    cover
        |> List.head
        |> Maybe.withDefault { url = "" }
        |> (\c -> img [ src c.url ] [])


artistView : ShowArtist -> Html Msg
artistView data =
    div []
        [ div [ class "artist-name" ] [ text data.artist.name ]
        , data.albums
            |> List.map
                (\a ->
                    div [ class "album" ]
                        [ div [] [ coverView Large a.images ]
                        , div [] [ text a.name ]
                        ]
                )
            |> div [ class "album-wrapper" ]
        ]


sidebarView : Html Msg
sidebarView =
    div [ class "sidebar" ]
        [ div [ class "logo" ] [ text "Beardify" ]
        , div [ class "top-menu" ]
            [ div [] [ i [ class "icon-home" ] [], text "Home" ]
            , div [] [ i [ class "icon-bell" ] [], text "Sorties" ]
            , div [ class "active" ] [ i [ class "icon-bookmark" ] [], text "A écouter" ]
            ]
        , div [ class "playlists" ]
            [ div [ class "title" ] [ text "Playlists" ]
            , div [ class "playlists-list" ]
                [ div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Compil tubes de l'été 1999" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Chansons du Club Dorothée" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Hymnes nationaux" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Faire du sport !" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Chill" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Go to the PARTY !" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Make war, don't love !" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Move your body" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "En voiture Simone" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Dodo" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Bricolage" ]
                ]
            ]
        ]


playerView : Html Msg
playerView =
    div [ class "player" ]
        [ div [ class "controls" ]
            [ div []
                [ button [ class "play" ] [ i [ class "icon-play" ] [] ]
                , button [] [ i [ class "icon-to-start" ] [] ]
                , button [] [ i [ class "icon-to-end" ] [] ]
                , button [] [ i [ class "icon-shuffle" ] [] ]
                , button [] [ i [ class "icon-loop" ] [] ]
                ]
            ]
        , div [ class "current" ]
            [ img [ class "cover", src "https://placekitten.com/100/100" ] []
            , div []
                [ div []
                    [ span [ class "track" ] [ text "Pretty Fly (For A White Guy)" ]
                    , span [] [ text " - " ]
                    , span [ class "artist" ] [ text "The Offspring" ]
                    ]
                , div [ class "range" ]
                    [ span [ class "time" ] [ text "2:30" ]
                    , input [ type_ "range" ] []
                    , span [ class "time" ] [ text "9:30" ]
                    ]
                ]
            ]
        , div [ class "options" ]
            [ div [] [ button [] [ i [ class "icon-sound" ] [] ] ]
            , div [] [ input [ type_ "range" ] [] ]
            ]
        ]


view : Model -> Document Msg
view model =
    { title = ""
    , body =
        [ div [ class "app" ]
            [ sidebarView
            , div [ class "content" ]
                [ div [ class "topbar" ]
                    [ searchView model.searchModel
                    ]
                , div [ class "drawer" ]
                    [ artistView model.drawerContent
                    ]
                , playerView
                ]
            ]
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

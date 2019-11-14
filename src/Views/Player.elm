module Views.Player exposing (Model, Msg(..), init, subscriptions, update, view)

import Data.Artist exposing (ArtistSimplified)
import Data.Image as Image
import Data.Player as Player exposing (Player)
import Data.Session exposing (Session)
import Data.Track as Track exposing (Track)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http
import Request.Player as Request
import Task
import Time exposing (Posix)


type alias Model =
    Maybe Player


type Msg
    = Pause
    | Paused (Result ( Session, Http.Error ) ())
    | Play
    | Played (Result ( Session, Http.Error ) ())
    | Refresh Posix
    | Refreshed (Result ( Session, Http.Error ) Player)


init : Session -> ( Model, Cmd Msg )
init session =
    ( Nothing, Task.attempt Refreshed (Request.get session) )


update : Session -> Msg -> Model -> ( Model, Session, Cmd Msg )
update session msg model =
    case msg of
        Pause ->
            let
                newPlayer =
                    Maybe.map (\player -> { player | playing = False })
            in
            ( newPlayer model, session, Task.attempt Paused (Request.pause session) )

        Play ->
            let
                newPlayer =
                    Maybe.map (\player -> { player | playing = True })
            in
            ( newPlayer model, session, Task.attempt Played (Request.play session) )

        Paused (Ok _) ->
            ( model, session, Cmd.none )

        Paused (Err ( newSession, err )) ->
            ( model, newSession, Cmd.none )

        Played (Ok _) ->
            ( model, session, Cmd.none )

        Played (Err ( newSession, err )) ->
            ( model, newSession, Cmd.none )

        Refresh _ ->
            ( model, session, Task.attempt Refreshed (Request.get session) )

        Refreshed (Ok player) ->
            ( Just player, session, Cmd.none )

        Refreshed (Err ( newSession, err )) ->
            ( model, session, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Time.every 1000 Refresh
        ]


artistView : ArtistSimplified -> Html msg
artistView artist =
    a [ href "", class "Artist__link" ] [ text artist.name ]


view : Model -> Html Msg
view player =
    case player of
        Just ({ track } as player_) ->
            let
                cover =
                    Image.filterByWidth 64 track.album.images
            in
            div [ class "Player" ]
                [ div [ class "PlayerControl" ]
                    [ if player_.playing then
                        button [ class "PlayerControl__btn", onClick Pause ] [ i [ class "icon-pause" ] [] ]

                      else
                        button [ class "PlayerControl__btn", onClick Play ] [ i [ class "icon-play" ] [] ]
                    , button [ class "PlayerControl__btn" ] [ i [ class "icon-to-start" ] [] ]
                    , button [ class "PlayerControl__btn" ] [ i [ class "icon-to-end" ] [] ]
                    ]
                , div [ class "PlayerCurrent" ]
                    [ img [ class "PlayerCurrent__cover", src cover.url ] []
                    , div [ class "PlayerCurrent__control" ]
                        [ div []
                            ([ span [ class "PlayerCurrent__song" ] [ text track.name ]
                             , span [] [ text " - " ]
                             ]
                                ++ List.map artistView track.album.artists
                            )
                        , div [ class "PlayerCurrent__bar" ]
                            [ span [ class "PlayerCurrent__time" ] [ text <| Track.durationFormat player_.progress ]
                            , input
                                [ class "Range"
                                , type_ "range"
                                , Html.Attributes.min "0"
                                , Html.Attributes.value <| String.fromInt player_.progress
                                , Html.Attributes.max <| String.fromInt track.duration
                                ]
                                []
                            , span [ class "PlayerCurrent__time" ] [ text <| Track.durationFormat track.duration ]
                            ]
                        ]
                    ]
                ]

        -- (toFloat player_.progress / toFloat track.duration * 100)
        Nothing ->
            div [ class "Player" ] []

module Views.Player exposing (Model, Msg(..), update, view)

import Data.Image
import Data.Player
import Data.Session exposing (Session)
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Http
import Request as Request
import Route
import Task
import Utils
import Views.Artist


type alias Model =
    Data.Player.Model


type Msg
    = Play
    | Pause
    | NoOp (Result Http.Error ())


update : Session -> Msg -> Model -> ( Model, Cmd Msg )
update ({ token } as session) msg model =
    case msg of
        Play ->
            ( model
            , Http.send NoOp <| Request.put "" "play" "" token
            )

        Pause ->
            ( model, Http.send NoOp <| Request.put "" "pause" "" token )

        NoOp (Ok _) ->
            ( model, Cmd.none )

        NoOp (Err _) ->
            ( model, Cmd.none )


view : Model -> Html Msg
view player =
    div [ class "player" ]
        [ div [ class "controls" ]
            [ div []
                [ if player.is_playing then
                    button [ onClick Pause, class "play" ] [ i [ class "icon-pause" ] [] ]

                  else
                    button [ onClick Play, class "play" ] [ i [ class "icon-play" ] [] ]
                , button [] [ i [ class "icon-to-start" ] [] ]
                , button [] [ i [ class "icon-to-end" ] [] ]
                , button
                    [ classList [ ( "active", player.shuffle_state ) ]
                    ]
                    [ i [ class "icon-shuffle" ] [] ]
                , button [] [ i [ classList [ ( "icon-loop", True ), ( "active", player.repeat_state == "on" ) ] ] [] ]
                ]
            ]
        , div [ class "current" ]
            [ a [ Route.href (Route.Album player.item.album.id) ] [ Data.Image.imageView Data.Image.Small player.item.album.images ]
            , div []
                [ div []
                    [ span [ class "track" ] [ text player.item.name ]
                    , span [] [ text " - " ]
                    , Views.Artist.artistList player.item.artists
                    ]
                , div [ class "range" ]
                    [ span [ class "time" ] [ text <| Utils.durationFormat player.progress_ms ]
                    , input
                        [ type_ "range"
                        , Html.Styled.Attributes.value <| String.fromInt player.progress_ms
                        , Html.Styled.Attributes.min "0"
                        , Html.Styled.Attributes.max <| String.fromInt player.item.duration_ms
                        ]
                        []
                    , span [ class "time" ] [ text <| Utils.durationFormat player.item.duration_ms ]
                    , div [ class "progress" ]
                        [ div
                            [ style "width" <| String.fromFloat (toFloat player.progress_ms / toFloat player.item.duration_ms * 100) ++ "%"
                            , class "progress-current"
                            ]
                            []
                        ]
                    ]
                ]
            ]
        , div [ class "options" ]
            [ div []
                [ button
                    [ classList [ ( "active", player.device.volume_percent == 0 ) ]
                    ]
                    [ i [ class "icon-sound" ] [] ]
                ]
            , div [ class "range" ]
                [ input
                    [ type_ "range"
                    , Html.Styled.Attributes.value <| String.fromInt player.device.volume_percent
                    , Html.Styled.Attributes.min "0"
                    , Html.Styled.Attributes.max "100"
                    ]
                    []
                , div [ class "progress" ]
                    [ div
                        [ style "width" <| String.fromFloat (toFloat player.device.volume_percent) ++ "%"
                        , class "progress-current"
                        ]
                        []
                    ]
                ]
            ]
        ]

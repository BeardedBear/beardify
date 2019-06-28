module Views.Player exposing (Model, Msg(..), update, view)

import Data.Image
import Data.Player
import Data.Session exposing (Session)
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (..)
import Http
import Request as Request
import Route
import Task
import Utils
import Views.Artist


type alias Model =
    Data.Player.Model


type Msg
    = NoOp (Result Http.Error ())
    | Seek String
    | Volume String
    | VolumeToggleMute String
    | Next
    | Previous
    | Play
    | Pause
    | ShuffleOff
    | ShuffleOn
    | RepeatOff
    | RepeatOn


update : Session -> Msg -> Model -> ( Model, Cmd Msg )
update ({ token } as session) msg model =
    case msg of
        NoOp (Err _) ->
            ( model, Cmd.none )

        NoOp (Ok _) ->
            ( model, Cmd.none )

        Seek e ->
            ( model, Http.send NoOp <| Request.put "seek?position_ms=" e "" token )

        Volume e ->
            ( model, Http.send NoOp <| Request.put "volume?volume_percent=" e "" token )

        VolumeToggleMute e ->
            ( model, Http.send NoOp <| Request.put "volume?volume_percent=" e "" token )

        Next ->
            ( model, Http.send NoOp <| Request.post "me/player/" "next" "" token )

        Previous ->
            ( model, Http.send NoOp <| Request.post "me/player/" "previous" "" token )

        Play ->
            ( model, Http.send NoOp <| Request.put "" "play" "" token )

        Pause ->
            ( model, Http.send NoOp <| Request.put "" "pause" "" token )

        ShuffleOff ->
            ( model, Http.send NoOp <| Request.put "" "" "shuffle?state=false" token )

        ShuffleOn ->
            ( model, Http.send NoOp <| Request.put "" "" "shuffle?state=true" token )

        RepeatOff ->
            ( model, Http.send NoOp <| Request.put "" "" "repeat?state=off" token )

        RepeatOn ->
            ( model, Http.send NoOp <| Request.put "" "" "repeat?state=track" token )


view : Model -> Html Msg
view player =
    div [ class "player" ]
        [ div [ class "controls" ]
            [ div []
                [ if player.is_playing then
                    button [ onClick Pause, class "play" ] [ i [ class "icon-pause" ] [] ]

                  else
                    button [ onClick Play, class "play" ] [ i [ class "icon-play" ] [] ]
                , button [ onClick Previous ] [ i [ class "icon-to-start" ] [] ]
                , button [ onClick Next ] [ i [ class "icon-to-end" ] [] ]
                , button
                    [ classList
                        [ ( "active", player.shuffle_state )
                        ]
                    , if player.shuffle_state then
                        onClick ShuffleOff

                      else
                        onClick ShuffleOn
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
                        , onInput Seek
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
                    , onInput Volume
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

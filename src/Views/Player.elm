module Views.Player exposing (Msg(..), update, view)

import Data.Image
import Data.Player exposing (PlayerModel)
import Data.Session exposing (Session)
import Html exposing (Html, a, button, div, i, input, span, text)
import Html.Attributes exposing (class, classList, style, type_)
import Html.Events exposing (onClick, onInput)
import Http
import Request as Request
import Route
import Utils
import Views.Artist


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


update : Session -> Msg -> PlayerModel -> ( PlayerModel, Cmd Msg )
update { token } msg model =
    case msg of
        NoOp (Err _) ->
            ( model, Cmd.none )

        NoOp (Ok _) ->
            ( model, Cmd.none )

        Seek duration ->
            ( model, Http.send NoOp <| Request.put "seek?position_ms=" duration "" token )

        Volume percent ->
            ( model
            , Http.send NoOp <| Request.put "volume?volumePercent=" percent "" token
            )

        VolumeToggleMute percent ->
            ( model, Http.send NoOp <| Request.put "volume?volumePercent=" percent "" token )

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


controlsView : PlayerModel -> Html Msg
controlsView player =
    div [ class "PlayerControls" ]
        [ div []
            [ if player.is_playing then
                button [ onClick Pause, class "PlayerControls__button play" ] [ i [ class "icon-pause" ] [] ]

              else
                button [ onClick Play, class "PlayerControls__button play" ] [ i [ class "icon-play" ] [] ]
            , button [ class "PlayerControls__button", onClick Previous ] [ i [ class "icon-to-start" ] [] ]
            , button [ class "PlayerControls__button", onClick Next ] [ i [ class "icon-to-end" ] [] ]
            , button
                [ classList
                    [ ( "PlayerControls__button", True )
                    , ( "active", player.shuffle_state )
                    ]
                , if player.shuffle_state then
                    onClick ShuffleOff

                  else
                    onClick ShuffleOn
                ]
                [ i [ class "icon-shuffle" ] [] ]
            , button [ class "PlayerControls__button" ]
                [ i
                    [ classList
                        [ ( "icon-loop", True )
                        , ( "active", player.repeat_state == "on" )
                        ]
                    ]
                    []
                ]
            ]
        ]


playingView : PlayerModel -> Html Msg
playingView player =
    div [ class "Player__current" ]
        [ a [ Route.href (Route.Album player.item.album.id) ] [ Data.Image.imageView Data.Image.Small "Cover" player.item.album.images ]
        , div []
            [ div []
                [ span [ class "PlayerPlaying__trackName" ] [ text player.item.name ]
                , span [] [ text " - " ]
                , Views.Artist.view player.item.artists
                ]
            , div [ class "PlayerPlaying" ]
                [ span [ class "PlayerPlaying__time" ] [ text <| Utils.durationFormat player.progress_ms ]
                , div [ class "PlayerRange" ]
                    [ input
                        [ type_ "range"
                        , class "PlayerRange__input current"
                        , Html.Attributes.value <| String.fromInt player.progress_ms
                        , Html.Attributes.min "0"
                        , Html.Attributes.max <| String.fromInt player.item.duration_ms
                        , onInput Seek
                        ]
                        []
                    ]
                , span [ class "PlayerPlaying__time" ] [ text <| Utils.durationFormat player.item.duration_ms ]
                , div [ class "PlayerProgress current" ]
                    [ div
                        [ style "width" <| String.fromFloat (toFloat player.progress_ms / toFloat player.item.duration_ms * 100) ++ "%"
                        , class "PlayerProgress__current"
                        ]
                        []
                    ]
                ]
            ]
        ]


volumeView : PlayerModel -> Html Msg
volumeView player =
    div [ class "PlayerVolume" ]
        [ div []
            [ button
                [ classList
                    [ ( "active", player.device.volumePercent == 0 )
                    , ( "PlayerControls__button", True )
                    ]
                ]
                [ i [ class "icon-sound" ] [] ]
            ]
        , div [ class "PlayerRange" ]
            [ input
                [ type_ "range"
                , class "PlayerRange__input volume"
                , Html.Attributes.value <| String.fromInt player.device.volumePercent
                , Html.Attributes.min "0"
                , Html.Attributes.max "100"
                , onInput Volume
                ]
                []
            , div [ class "PlayerProgress volume" ]
                [ div
                    [ style "width" <| String.fromFloat (toFloat player.device.volumePercent) ++ "%"
                    , class "PlayerProgress__current"
                    ]
                    []
                ]
            ]
        ]


view : PlayerModel -> Html Msg
view player =
    div [ class "Player" ]
        [ controlsView player
        , playingView player
        , div [ class "PlayerDevice" ]
            [ i [ class "icon icon-pc" ] []
            , div [ class "PlayerDevice__menu" ]
                [ div [ class "PlayerDevice__item active" ] [ i [ class "icon icon-pc" ] [], text "Ordinateur" ]
                , div [ class "PlayerDevice__item" ] [ i [ class "icon icon-mobile" ] [], text "Mobile" ]
                ]
            ]
        , volumeView player
        ]

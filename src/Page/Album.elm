module Page.Album exposing (Msg(..), init, update, view)

import Data.Album exposing (Album, albumInit, decodeAlbum)
import Data.Image exposing (ImageSize(..), imageView)
import Data.Meta exposing (AlbumModel)
import Data.Session exposing (Session)
import Data.Track exposing (TrackSimplified, TrackSimplifiedPaging, decodeTrackSimplified, decodeTrackSimplifiedPaging)
import Html exposing (Html, div, i, span, text)
import Html.Attributes exposing (class, classList)
import Html.Events exposing (onClick)
import Http
import Json.Decode as Decode exposing (map)
import List.Extra as LE
import Request
import Utils
import Views.Artist
import Views.Modal


init : String -> Session -> ( AlbumModel, Cmd Msg )
init id session =
    ( { album = albumInit
      , tracks =
            { items = []
            , next = ""
            }
      , modal =
            { isOpen = False
            , inPocket = []
            }
      }
    , Cmd.batch
        [ Http.send SetAlbum <| Request.get "albums/" id "" decodeAlbum session.token
        , Http.send SetAlbumTracks <| Request.get "albums/" id "/tracks" decodeTrackSimplifiedPaging session.token
        ]
    )


type Msg
    = NoOp
    | SetAlbum (Result Http.Error Album)
    | SetAlbumTracks (Result Http.Error TrackSimplifiedPaging)
    | PlayTracks (List String)
    | PlayAlbum String
    | ModalOpen (Result Http.Error (List TrackSimplified))
    | ModalGetTrack String
    | ModalAddTrack String
    | SetModalTrack (Result Http.Error ())
    | ModalClear


update : Session -> Msg -> AlbumModel -> ( AlbumModel, Cmd Msg )
update session msg ({ tracks, modal } as model) =
    case msg of
        NoOp ->
            ( model, Cmd.none )

        SetAlbum (Ok e) ->
            ( { model | album = e }
            , Cmd.none
            )

        SetAlbum (Err _) ->
            ( model, Cmd.none )

        SetAlbumTracks (Ok e) ->
            let
                concat =
                    model.tracks.items ++ e.items
            in
            ( { model | tracks = { tracks | items = concat } }
            , if e.next /= "" then
                Cmd.batch [ Http.send SetAlbumTracks <| Request.getPaging e.next decodeTrackSimplifiedPaging session.token ]

              else
                Cmd.none
            )

        SetAlbumTracks (Err _) ->
            ( model, Cmd.none )

        PlayTracks _ ->
            ( model, Cmd.none )

        PlayAlbum _ ->
            ( model, Cmd.none )

        ModalOpen (Ok e) ->
            let
                firstTrack =
                    e
                        |> List.map (\f -> f.uri)
                        |> List.take 1
            in
            ( { model | modal = { modal | isOpen = True, inPocket = firstTrack } }
            , Cmd.none
            )

        ModalOpen (Err _) ->
            ( model, Cmd.none )

        ModalGetTrack e ->
            ( model
            , Cmd.batch
                [ Http.send ModalOpen <| Request.get "albums/" e "/tracks" (Decode.at [ "items" ] (Decode.list decodeTrackSimplified)) session.token
                ]
            )

        ModalAddTrack e ->
            let
                listTracks =
                    String.concat model.modal.inPocket
            in
            ( model, Http.send SetModalTrack <| Request.post "playlists/" e ("/tracks?position=0&uris=" ++ listTracks) session.token )

        SetModalTrack (Ok _) ->
            ( { model | modal = { modal | isOpen = False } }
            , Cmd.none
            )

        SetModalTrack (Err _) ->
            ( model, Cmd.none )

        ModalClear ->
            ( { model | modal = { modal | isOpen = False } }
            , Cmd.none
            )


view : Session -> AlbumModel -> ( String, List (Html Msg) )
view session model =
    let
        listTracksUri id =
            model.tracks.items
                |> LE.dropWhile (\e -> e.uri /= id)
                |> List.map (\k -> k.uri)

        trackItem t =
            div
                [ classList
                    [ ( "track album-page", True )
                    , ( "active", t.uri == session.player.item.uri )
                    ]
                ]
                [ div [] []
                , div [] [ text <| String.fromInt t.track_number ++ "." ]
                , div [ onClick <| PlayTracks (listTracksUri t.uri) ] [ text t.name ]
                , div [] [ text (Utils.durationFormat t.duration_ms) ]
                ]

        trackSumDuration =
            model.tracks.items
                |> List.map (\d -> d.duration_ms)
                |> List.sum
    in
    ( model.album.name
    , [ Views.Modal.view
            { isOpen = model.modal.isOpen
            , session = session
            , close = ModalClear
            , add = ModalAddTrack
            }
      , div [ class "album-wrapper" ]
            [ div [ class "bg-cover" ] [ imageView Large model.album.images ]
            , div [ class "album-page-head" ]
                [ div [ class "heading-page" ] [ text model.album.name ]
                , div []
                    [ span [] [ text "By " ]
                    , span [] [ Views.Artist.artistList model.album.artists ]
                    ]
                ]
            , div [ class "album-page" ]
                [ div []
                    [ div
                        [ classList
                            [ ( "album", True )
                            , ( "active", model.album.uri == session.player.item.album.uri )
                            ]
                        ]
                        [ div [ class "img" ]
                            [ imageView Large model.album.images
                            ]
                        , div [ class "playing-btn", onClick <| PlayAlbum model.album.uri ] [ i [ class "icon-play" ] [] ]
                        , div [ class "add-btn", onClick <| ModalGetTrack model.album.id ] [ i [ class "icon-add" ] [] ]
                        , div [] [ text <| Utils.releaseDateFormat model.album.release_date ]
                        , div [] [ text <| Utils.durationFormatMinutes trackSumDuration ]
                        ]
                    ]
                , div []
                    [ div [] (model.tracks.items |> List.map trackItem)
                    ]
                ]
            ]
      ]
    )

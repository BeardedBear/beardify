module Data.Drawer exposing (AlbumModel, ArtistModel, DrawerType(..), Model, PlaylistModel, init)

import Data.Album as Album exposing (..)
import Data.Artist as Artist exposing (..)
import Data.Playlist as Playlist exposing (..)
import Data.Track as Track exposing (..)
import Data.Youtube exposing (..)


init : Model
init =
    { drawerType = Home
    , drawerArtist =
        { artist = Artist.init
        , albums = []
        , videos = []
        , topTracks = []
        , relatedArtists = []
        }
    , drawerAlbum =
        { album = Album.init
        , tracks = []
        }
    , drawerPlaylist =
        { playlist = Playlist.init
        , tracks = { items = [] }
        }
    , drawerCollection =
        { playlist = Playlist.init
        , tracks = { items = [] }
        }
    }


type alias ArtistModel =
    { artist : Artist
    , albums : List Album
    , videos : List Video
    , topTracks : List Track
    , relatedArtists : List Artist
    }


type alias AlbumModel =
    { album : Album
    , tracks : List TrackSimplified
    }


type alias PlaylistModel =
    { playlist : Playlist
    , tracks : PlaylistPaging
    }


type DrawerType
    = DrawArtist
    | DrawAlbum
    | DrawPlaylist
    | DrawCollection
    | Home
    | Releases
    | Listen


type alias Model =
    { drawerType : DrawerType
    , drawerArtist : ArtistModel
    , drawerAlbum : AlbumModel
    , drawerPlaylist : PlaylistModel
    , drawerCollection : PlaylistModel
    }

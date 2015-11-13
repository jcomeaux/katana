# This file is part of Buildbot.  Buildbot is free software: you can
# redistribute it and/or modify it under the terms of the GNU General Public
# License as published by the Free Software Foundation, version 2.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
# details.
#
# You should have received a copy of the GNU General Public License along with
# this program; if not, write to the Free Software Foundation, Inc., 51
# Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#
# Copyright Buildbot Team Members

import mock
from twisted.trial import unittest
from buildslave.scripts import start, stop, restart
from buildslave.test.util import misc


class TestRestart(misc.IsBuildslaveDirMixin,
                  misc.StdoutAssertionsMixin,
                  unittest.TestCase):
    """
    Test buildslave.scripts.restart.restart()
    """
    config = {"basedir": "dummy", "nodaemon": False, "quiet": False}

    def setUp(self):
        self.setUpStdoutAssertions()

        # patch basedir check to always succeed
        self.setupUpIsBuildslaveDir(True)

        # patch start.startSlave() to do nothing
        self.startSlave = mock.Mock()
        self.patch(start, "startSlave", self.startSlave)

    def test_no_slave_running(self):
        """
        test calling restart() when no slave is running
        """
        # patch stopSlave() to raise an exception
        mock_stopSlave = mock.Mock(side_effect=stop.SlaveNotRunning())
        self.patch(stop, "stopSlave", mock_stopSlave)

        # check that restart() calls startSlave() and prints correct messages
        restart.restart(self.config)
        self.startSlave.assert_called_once_with(self.config["basedir"],
                                                self.config["quiet"],
                                                self.config["nodaemon"])
        self.assertStdoutEqual("no old buildslave process found to stop\n"
                               "now restarting buildslave process..\n")

    def test_restart(self):
        """
        test calling restart() when slave is running
        """
        # patch stopSlave() to do nothing
        mock_stopSlave = mock.Mock()
        self.patch(stop, "stopSlave", mock_stopSlave)

        # check that restart() calls startSlave() and prints correct messages
        restart.restart(self.config)
        self.startSlave.assert_called_once_with(self.config["basedir"],
                                                self.config["quiet"],
                                                self.config["nodaemon"])
        self.assertStdoutEqual("now restarting buildslave process..\n")

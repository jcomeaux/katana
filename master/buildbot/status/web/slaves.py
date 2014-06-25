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
import json
import time
import urllib

from twisted.internet import defer
from twisted.web import html
from twisted.web.resource import NoResource
from twisted.web.util import Redirect
from buildbot.status.web.base import HtmlResource, \
    BuildLineMixin, ActionResource, path_to_slave, path_to_authzfail, path_to_json_slaves, \
    path_to_json_past_slave_builds, path_to_json_slave_builds
from buildbot.status.web.status_json import SlavesJsonResource, FilterOut, PastBuildsJsonResource, \
    SlaveBuildsJsonResource


from buildbot import util
from buildbot.status.web.base import ActionResource
from buildbot.status.web.base import BuildLineMixin
from buildbot.status.web.base import HtmlResource
from buildbot.status.web.base import abbreviate_age
from buildbot.status.web.base import path_to_authzfail
from buildbot.status.web.base import path_to_slave

class ShutdownActionResource(ActionResource):
    def __init__(self, slave):
        self.slave = slave
        self.action = "gracefulShutdown"

    @defer.inlineCallbacks
    def performAction(self, request):
        res = yield self.getAuthz(request).actionAllowed(self.action,
                                                         request,
                                                         self.slave)

        url = None
        if res:
            self.slave.setGraceful(True)
            url = path_to_slave(request, self.slave)
        else:
            url = path_to_authzfail(request)
        defer.returnValue(url)


class PauseActionResource(ActionResource):

    def __init__(self, slave, state):
        self.slave = slave
        self.action = "pauseSlave"
        self.state = state

    @defer.inlineCallbacks
    def performAction(self, request):
        res = yield self.getAuthz(request).actionAllowed(self.action,
                                                         request,
                                                         self.slave)

        url = None
        if res:
            self.slave.setPaused(self.state)
            url = path_to_slave(request, self.slave)
        else:
            url = path_to_authzfail(request)
        defer.returnValue(url)

# /buildslaves/$slavename


class OneBuildSlaveResource(HtmlResource, BuildLineMixin):
    addSlash = False

    def __init__(self, slavename):
        HtmlResource.__init__(self)
        self.slavename = slavename

    def getPageTitle(self, req):
        return "Katana - %s" % self.slavename

    def getChild(self, path, req):
        s = self.getStatus(req)
        slave = s.getSlave(self.slavename)
        if path == "shutdown":
            return ShutdownActionResource(slave)
        if path == "pause" or path == "unpause":
            return PauseActionResource(slave, path == "pause")
        return Redirect(path_to_slave(req, slave))

    def content(self, request, ctx):
        s = self.getStatus(request)
        slave = s.getSlave(self.slavename)

        my_builders = []
        for bname in s.getBuilderNames():
            b = s.getBuilder(bname)
            for bs in b.getSlaves():
                if bs.getName() == self.slavename:
                    my_builders.append(b)

        # Current builds
        current_builds = []
        for b in my_builders:
            for cb in b.getCurrentBuilds():
                if cb.getSlavename() == self.slavename:
                    current_builds.append(self.get_line_values(request, cb))

        try:
            max_builds = int(request.args.get('numbuilds')[0])
        except:
            max_builds = 15

        bbURL = s.getBuildbotURL()
        recent_builds_json = PastBuildsJsonResource(s, max_builds, slave_status=slave_status)
        recent_builds_dict = recent_builds_json.asDict(request)
        recent_builds_url = bbURL + path_to_json_past_slave_builds(request, self.slavename, max_builds)
        ctx['instant_json']['recent_builds'] = {"url": recent_builds_url,
                                                "data": json.dumps(recent_builds_dict)}

        curr_builds_json = SlaveBuildsJsonResource(s, slave_status)
        curr_builds_dict = curr_builds_json.asDict(request)
        curr_builds_url = bbURL + path_to_json_slave_builds(request, self.slavename)
        ctx['instant_json']['current_builds'] = {"url": curr_builds_url,
                                                 "data": json.dumps(curr_builds_dict)}


        # connects over the last hour
        slave = s.getSlave(self.slavename)
        connect_count = slave.getConnectCount()

        if slave.isPaused():
            pause_url = request.childLink("unpause")
        else:
            pause_url = request.childLink("pause")

        ctx.update(dict(slave=slave,
                        slavename=slave.getFriendlyName(),
                        current=current_builds,
                        shutdown_url=request.childLink("shutdown"),
                        pause_url=pause_url,
                        authz=self.getAuthz(request),
                        this_url="../../../" + path_to_slave(request, slave),
                        access_uri=slave.getAccessURI()),
                        admin=unicode(slave.getAdmin() or '', 'utf-8'),
                        host=unicode(slave.getHost() or '', 'utf-8'),
                        info=slave.getInfoAsDict(),
                        slave_version=slave.getVersion(),
                        show_builder_column=True,
                        connect_count=connect_count)
        template = request.site.buildbot_service.templates.get_template("buildslave.html")
        data = template.render(**ctx)
        return data


# /buildslaves


class BuildSlavesResource(HtmlResource):
    pageTitle = "Katana Build slaves"
    addSlash = True

    @defer.inlineCallbacks
    def content(self, request, cxt):
        s = self.getStatus(request)

        slaves = SlavesJsonResource(s)
        slaves_dict = yield slaves.asDict(request)
        slaves_dict = FilterOut(slaves_dict)

        cxt['instant_json']["slaves"] = {"url": s.getBuildbotURL() + path_to_json_slaves(request) + "?filter=1",
                                         "data": json.dumps(slaves_dict)}

        template = request.site.buildbot_service.templates.get_template("buildslaves.html")
        defer.returnValue(template.render(**cxt))

    def getChild(self, path, req):
        try:
            self.getStatus(req).getSlave(path)
            return OneBuildSlaveResource(path)
        except KeyError:
            return NoResource("No such slave '%s'" % html.escape(path))

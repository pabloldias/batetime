$(function () {
    $('.check-player').button();
});

function MyCtrl($scope, $filter) {
    
    $scope.selecting = false;
    $scope.goalkeeper = true;
    $scope.players = Player.getPlayers();
    $scope.teams = [];
    
    var getPlayersPerTeam = function() {
        var playersPerTeam = 4;
        if ($scope.goalkeeper) {
            playersPerTeam = 5;
        }
        return playersPerTeam
    }
    
    var getSelectedPlayers = function () {
        return $filter('filter')($scope.players, {checked: true});
    };
    
    var mapPriority = function(player) { 
        var getPriority = function(level) {
            switch (level) {
                case 1: return 20; break;
                case 2: return 10; break;
                default: return 0;
            }
        }
        player.priority = player.level + getPriority(player.level) + Math.random()
        player.canWait = (player.level === 3 || player.level === 4)
        return player
    }
    
    var getSelectedCount = function () {
        return getSelectedPlayers().length;
    };
    
    var getTeamCount = function() {
        return Math.floor(getSelectedCount() / getPlayersPerTeam());
    }
    
    var getWaitingCount = function() {
        return Math.floor(getSelectedCount() % getPlayersPerTeam());
    }
    
    $scope.selectPlayers = function() {
        $scope.selecting = true;
    };
    
    $scope.endSelection = function() {
        $scope.distribute();
        $scope.selecting = false;
    };
    
    $scope.getSelectionMessage = function() {
        var selectedCount = getSelectedCount(),
            total = $scope.players.length,
            message = "";
        
        if (selectedCount === 0) {
            message = total + " jogadores est�o dispon�veis para sele��o";
        }
        else {            
            message = "Voc� selecionou " + selectedCount + " de " + total + " jogadores, ";
            
            var teamCount = getTeamCount()
            if (teamCount === 0) {
                message += "o que n�o d� um time ainda"
            }
            else {
                message += "que ser�o divididos em " + teamCount + " time" + (teamCount > 1 ? "s" : "");
                if (getWaitingCount() > 0) {
                    message += ", deixando " + getWaitingCount() + " de fora";
                }
            }
        
        }
        
        return message + '.';
    }
        
    $scope.distribute = function() {
        var classifiedPlayers = getSelectedPlayers().map(mapPriority),
            players = $filter('orderBy')(classifiedPlayers, '-priority'),
            teamCount = getTeamCount(),
            waitingCount = getWaitingCount(),
            playersPerTeam = getPlayersPerTeam();
            
        if (waitingCount > 0) {
            teamCount++;
        }
        
        $scope.teams = [];
    
        for (var i = 1; i <= teamCount; i++) {
            $scope.teams.push({
                'name': i,
                'players': [],
                'max': ((i === teamCount && waitingCount > 0) ? waitingCount : playersPerTeam)
            });
        };
        
        var waitingTeam = -1;
        if (waitingCount > 0) {
            waitingTeam = teamCount - 1;
        }
        
        var team = -1;
        
        for (var i = 0; i < players.length; i++) {
            team++;
        
            if (team > teamCount) {
                team = 0;
            }
            
            if (team === waitingTeam && !players[i].canWait) {
                team = 0;
            }          

            $scope.teams[team].players.push(players[i]);
        };
    }
}
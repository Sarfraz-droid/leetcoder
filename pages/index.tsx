// import useSWR from "swr";
import { useEffect, useState } from "react";
import Link from "next/link";
import CreateGroup from "../components/CreateGroup";
import {
  Card,
  Col,
  Divider,
  Row,
  Typography,
  theme,
  Input,
  Space,
  message,
  Avatar,
  Spin,
  Button,
  Tooltip,
  Modal,
} from "antd";
import JoinGroup from "../components/JoinGroup";
import IGroup, { IGroupMember } from "../@types/group";
import GroupList from "../components/GroupList";
import axios from "axios";
import {
  loadUserFromLocal,
  removeUserFromLocal,
  saveUserToLocal,
} from "../utils";
import SITE_CONFIG from "../site_config";
import {
  CopyFilled,
  EyeFilled,
  LinkOutlined,
  Loading3QuartersOutlined,
  LoadingOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { group } from "console";

const { Search } = Input;
const { Text, Title } = Typography;
const { Meta } = Card;

export default function Index() {
  const router = useRouter();
  const { token } = theme.useToken();
  const query = router.query;
  const inviteID = query.invite_id as string;
  const [searchString, setSearchString] = useState("");
  const [searchResult, setSearchResult] = useState<IGroup[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [savedUserLoading, setSavedUserLoading] = useState(false);

  const [savedUser, setSavedUser] = useState<IGroupMember | null>(null);

  const searchResultHandler = async () => {
    if (searchLoading) return;

    setSearchLoading(true);
    try {
      const res = await axios.get(`/api/groups/search?name=${searchString}`);
      setSearchResult(res.data);
    } catch (error) {
      console.log(error);
    }
    setSearchLoading(false);
  };

  useEffect(() => {
    const loadUser = async () => {
      setSavedUserLoading(true);
      try {
        console.log("Fetching API");
        const user = await loadUserFromLocal();
        if (user == null) {
          setSavedUserLoading(false);
          return;
        }
        setSavedUser(user);
      } catch (error) {
        message.error(error.message);
      }

      setSavedUserLoading(false);
    };
    loadUser();
  }, []);

  return (
    <div>
      <Spin
        spinning={savedUserLoading}
        size="large"
        indicator={<LoadingOutlined />}
      >
        {savedUser ? (
          <SavedUserInfo savedUser={savedUser} setSavedUser={setSavedUser} />
        ) : (
          <LandingHero setSavedUser={setSavedUser} />
        )}
      </Spin>
      <Divider>OR</Divider>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-evenly",
          gap: 4,
        }}
      >
        <Card title="Create A Group" style={{ margin: "2em auto" }}>
          <CreateGroup />
        </Card>

        <Card
          id="join-group"
          title="Join Existing Group"
          style={{ margin: "2em auto" }}
        >
          <JoinGroup />
        </Card>
      </div>
      <Modal footer={null} open={!!inviteID}>
        {inviteID && <JoinGroup inviteID={inviteID} />}
      </Modal>
      <Divider />

      <Card title="Search" style={{ margin: "2em auto", maxWidth: "50rem" }}>
        <Search
          placeholder="group name"
          enterButton="Search"
          size="large"
          onSearch={searchResultHandler}
          loading={searchLoading}
          disabled={searchLoading}
          onChange={(e) => setSearchString(e.target.value)}
        />

        <GroupList groupList={searchResult} />
      </Card>
    </div>
  );
}

const LandingHero = ({ setSavedUser }: { setSavedUser: any }) => {
  const { token } = theme.useToken();
  const [loadUserString, setLoadUserString] = useState("");
  const [loading, setLoading] = useState(false);
  const loginUserHandler = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const resp = await axios.get(
        `/api/groups/user?leetcodeUsername=${loadUserString}`
      );
      const userInfo = resp.data;
      if (!userInfo) {
        setLoading(false);
        return message.error("No saved user found!");
      }
      message.success(`Found ${loadUserString} `);
      setSavedUser(userInfo as IGroupMember);
      saveUserToLocal(loadUserString);
    } catch (error) {
      message.error(error.message);
    }
    setLoading(false);
  };
  return (
    <div style={{ margin: "2em auto" }}>
      <Title style={{ fontSize: "5.5em" }}>
        <span style={{ color: token.colorPrimary }}>Leet</span>
        <span>
          <span style={{ color: token.colorWhite }}>coder</span>
          {/* <span style={{ color: token.colorPrimary }}>!</span> */}
        </span>
      </Title>
      <Typography.Paragraph style={{ fontSize: "1rem" }}>
        <ul style={{ marginLeft: "2rem" }}>
          <li>Create and join groups of LeetCode users</li>
          <li>
            Compare your LeetCode ranking against other users in your group
          </li>
          <li>Track your progress over time</li>
          <li>
            See how you rank compared to users with similar experience and
            expertise
          </li>
        </ul>
      </Typography.Paragraph>
      <div>
        <Space>
          <Text>Find the groups you are in:</Text>
          <Input.Search
            loading={loading}
            disabled={loading}
            onSearch={loginUserHandler}
            onChange={(e) => setLoadUserString(e.target.value)}
            placeholder="leetcode username"
            value={loadUserString}
          />
        </Space>
      </div>
    </div>
  );
};

const SavedUserInfo = ({
  savedUser,
  setSavedUser,
}: {
  savedUser: IGroupMember;
  setSavedUser: any;
}) => {
  const { token } = theme.useToken();
  const logoutHandler = () => {
    removeUserFromLocal();
    setSavedUser(null);
  };

  return (
    <div style={{ margin: "2em auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Title>
          <span>
            <span style={{ color: token.colorWhite }}>Hey </span>
            <span>
              <span style={{ color: token.colorPrimary }}>
                {savedUser.name.split(" ")[0]}
              </span>
              <span style={{ color: token.colorWhite }}>!</span>
            </span>
          </span>
        </Title>

        <Button
          shape="round"
          icon={<LogoutOutlined />}
          type="primary"
          onClick={logoutHandler}
        >
          Logout
        </Button>
      </div>

      <Title level={3}>Groups You have joined -</Title>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",

          gap: 4,
        }}
      >
        {savedUser.groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
};

const GroupCard = ({ group }: { group: IGroup }) => {
  const router = useRouter();

  const [copied, setCopied] = useState(false);
  let copyTimeout: any = null;
  const copyHandler = async () => {
    if (copyTimeout) {
      clearTimeout(copyTimeout);
      setCopied(false);
    }
    await navigator.clipboard.writeText(`${window.origin}/groups/${group.id}`);
    setCopied(true);
    copyTimeout = setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <Card
      style={{ width: 256, margin: "1em" }}
      cover={
        <img
          style={{ cursor: "pointer", objectFit: "cover", height: 156 }}
          onClick={() => router.push(`/groups/${group.id}`)}
          alt="cover photo"
          src={group.coverPhoto}
        />
      }
      actions={[
        <Space>
          <Tooltip title={copied ? "Copied!" : `Copy link to clipboard`}>
            <CopyFilled type="text" onClick={copyHandler} />
          </Tooltip>
        </Space>,
        <Space>
          <Tooltip title={`${group._count.members} members`}>
            <UserOutlined />
            {group._count.members}
          </Tooltip>
        </Space>,
      ]}
    >
      <Link href={`/groups/${group.id}`}>
        <Meta
          avatar={<Avatar src={SITE_CONFIG.leetcode_logo} />}
          title={`${group.name}`}
          description={
            <Typography.Paragraph>{group.description}</Typography.Paragraph>
          }
        />
      </Link>
    </Card>
  );
};

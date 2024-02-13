import React, { useState } from 'react';
import {
  BullseyeIcon,
  InfoCircleIcon,
  ThumbsUpIcon,
} from '@patternfly/react-icons';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CodeBlock,
  Divider,
  Icon,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import PropTypes from 'prop-types';
import TemplateProcessor from '@redhat-cloud-services/frontend-components-advisor-components/TemplateProcessor/TemplateProcessor';
import ObjectsModal from '../ObjectsModal/ObjectsModal';
import { ObjectsTableColumns } from '../../AppConstants';

const code = `oc get namespace -o jsonpath={range .items[*]}{.metadata.name}{"\t"}{.metadata.uid}{"\n"}{end}
  oc -n <namespace> get <resourceKind> -o jsonpath={range .items[*]}{.metadata.name}{"\t"}{.metadata.uid}{"\n"}{end}`;

const ExpandedRulesDetails = ({ more_info, resolution, objects }) => {
  const [objectsModalOpen, setObjectsModalOpen] = useState(false);
  return (
    <Card className="ins-c-report-details" style={{ boxShadow: 'none' }}>
      <CardBody>
        <ObjectsModal
          isModalOpen={objectsModalOpen}
          setIsModalOpen={setObjectsModalOpen}
          objects={objects}
        />
        <Stack
          className="ins-c-report-details__cards-stack"
          widget-type="InsightsRulesCard"
          hasGutter
        >
          <StackItem>
            <Card isCompact isPlain>
              <CardHeader>
                <Icon>
                  <BullseyeIcon className="ins-c-report-details__icon" />
                </Icon>
                <strong>Detected issues</strong>
              </CardHeader>
              <CardBody>
                This should be a reason field and extradata should provide us an
                array of reasons to list here
              </CardBody>
            </Card>
          </StackItem>
          <Divider />
          <StackItem>
            <Card isCompact isPlain>
              <CardHeader>
                <Icon>
                  <ThumbsUpIcon className="ins-c-report-details__icon" />
                </Icon>
                <strong>Steps to resolve</strong>
              </CardHeader>
              <CardBody>
                <TemplateProcessor template={resolution} />
              </CardBody>
            </Card>
          </StackItem>
          <Table borders={'compactBorderless'} aria-label="Objects table">
            <Thead>
              <Tr>
                <Th modifier="fitContent">{ObjectsTableColumns.object}</Th>
                <Th modifier="fitContent">{ObjectsTableColumns.kind}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {objects.slice(0, 3).map((object, key) => (
                <Tr key={key}>
                  <Td dataLabel={ObjectsTableColumns.object}>{object.uid}</Td>
                  <Td dataLabel={ObjectsTableColumns.kind}>{object.kind}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <StackItem>
            <Button
              variant="link"
              isInline
              onClick={() => setObjectsModalOpen(true)}
            >
              View all objects
            </Button>
          </StackItem>

          <br />
          <CardHeader>
            <strong>Note:</strong>
          </CardHeader>
          <CardBody>
            Red Hat avoids gathering and processing namespace and resource names
            as these may reveal confidential information. Namespaces and
            resources are identified by their UIDs instead. You can use
            in-cluster commands like the ones below to translate UIDs of
            affected resources to their names.
            <CodeBlock>{code}</CodeBlock>
          </CardBody>
          <React.Fragment>
            <Divider />
            <StackItem>
              <Card isCompact isPlain>
                <CardHeader>
                  <Icon>
                    <InfoCircleIcon className="ins-c-report-details__icon" />
                  </Icon>
                  <strong>Additional info</strong>
                </CardHeader>
                <CardBody>{more_info}</CardBody>
              </Card>
            </StackItem>
          </React.Fragment>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default ExpandedRulesDetails;

ExpandedRulesDetails.propTypes = {
  more_info: PropTypes.string.isRequired,
  resolution: PropTypes.string.isRequired,
  objects: PropTypes.arrayOf({
    kind: PropTypes.string,
    uid: PropTypes.string,
  }),
};

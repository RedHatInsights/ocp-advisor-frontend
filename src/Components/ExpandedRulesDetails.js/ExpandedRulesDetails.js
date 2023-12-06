import React from 'react';
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
  Divider,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import PropTypes from 'prop-types';
import TemplateProcessor from '../../Utilities/TemplateProcessor';

const columnNames = {
  object: 'Object ID',
  kind: 'Kind',
};

const ExpandedRulesDetails = ({ recommendations }) => {
  const { remediation } = recommendations[0];
  return (
    <Card className="ins-c-report-details" style={{ boxShadow: 'none' }}>
      <CardBody>
        <Stack
          className="ins-c-report-details__cards-stack"
          widget-type="InsightsRulesCard"
          hasGutter
        >
          <StackItem>
            <Card isCompact isPlain>
              <CardHeader>
                <BullseyeIcon className="ins-c-report-details__icon" />
                <strong>Detected issues</strong>
              </CardHeader>
              <CardBody>
                THIS FIELD IS NOT AVAILABLE IN THE API YET Lorem ipsum dolor,
                sit amet consectetur adipisicing elit. Neque accusantium veniam
                provident similique nesciunt ratione laborum nulla cupiditate
                recusandae iure assumenda, qui vel expedita error soluta fugiat
                quo perspiciatis dolorum!
              </CardBody>
            </Card>
          </StackItem>
          <Divider />
          <StackItem>
            <Card isCompact isPlain>
              <CardHeader>
                <ThumbsUpIcon className="ins-c-report-details__icon" />
                <strong>Steps to resolve</strong>
              </CardHeader>
              <CardBody>
                <TemplateProcessor template={remediation} />
              </CardBody>
            </Card>
          </StackItem>
          <Table borders={'compactBorderless'}>
            <Thead>
              <Tr>
                <Th modifier="fitContent">{columnNames.object}</Th>
                <Th modifier="fitContent">{columnNames.kind}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {recommendations[0].objects.slice(0, 3).map((object, key) => (
                <Tr key={key}>
                  <Td dataLabel={columnNames.object}>{object.uid}</Td>
                  <Td dataLabel={columnNames.kind}>{object.kind}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Button variant="link" isInline>
            View all objects
          </Button>
          <br />
          <CardHeader>
            <strong>Note:</strong>
          </CardHeader>
          <CardBody>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam
            nemo illo minima nam voluptatum tempora amet blanditiis velit
            aliquid omnis, repudiandae reiciendis ipsam aperiam expedita eius
            corrupti aliquam praesentium! Ullam?
          </CardBody>
          <React.Fragment>
            <Divider />
            <StackItem>
              <Card isCompact isPlain>
                <CardHeader>
                  <InfoCircleIcon className="ins-c-report-details__icon" />
                  <strong>Additional info</strong>
                </CardHeader>
                <CardBody>
                  it needs another fields - will contain markdown for the whole
                  section. Lorem ipsum dolor sit amet consectetur adipisicing
                  elit. Numquam nemo illo minima nam voluptatum tempora amet
                  blanditiis velit aliquid omnis, repudiandae reiciendis ipsam
                  aperiam expedita eius corrupti aliquam praesentium! Ullam?
                </CardBody>
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
  recommendations: PropTypes.shape({
    check: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    remediation: PropTypes.string.isRequired,
    objects: PropTypes.arrayOf({
      kind: PropTypes.string,
      uid: PropTypes.string,
    }),
  }),
};
